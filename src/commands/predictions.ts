import path from "node:path";
import { readFile, mkdir } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { Command } from "commander";
import { confirm } from "@inquirer/prompts";
import chalk from "chalk";
import { aiApiRequest, requireApiKey } from "../lib/ai-api.js";
import { CLIError } from "../lib/errors.js";
import { spinner, renderTable, jsonOutput, warn, success, bold, dim, link, formatDate } from "../lib/ui.js";
import type { Prediction, PredictionCreateRequest } from "../types/index.js";

const TERMINAL_STATUSES = new Set(["succeeded", "failed", "canceled"]);

function modelName(prediction: Prediction): string {
  return typeof prediction.model === "string" ? prediction.model : prediction.model?.name ?? "—";
}

function outputUrls(prediction: Prediction): string[] {
  if (Array.isArray(prediction.output)) return prediction.output;
  return prediction.output ? [prediction.output] : [];
}

function predictionStatus(status: string): string {
  if (status === "succeeded") return chalk.green(status);
  if (status === "failed") return chalk.red(status);
  if (status === "canceled") return chalk.yellow(status);
  return chalk.cyan(status);
}

function showPrediction(prediction: Prediction): void {
  console.log();
  console.log(`  ${bold("ID:")}      ${prediction.id}`);
  console.log(`  ${bold("Model:")}   ${modelName(prediction)}`);
  console.log(`  ${bold("Status:")}  ${predictionStatus(prediction.status)}`);
  if (prediction.created_at) console.log(`  ${bold("Created:")} ${formatDate(prediction.created_at)}`);
  for (const [index, url] of outputUrls(prediction).entries()) {
    console.log(`  ${bold(`Output ${index + 1}:`)} ${link(url)}`);
  }
  if (prediction.error) console.log(`  ${bold("Error:")}   ${chalk.red(prediction.error)}`);
  console.log();
}

async function parseInput(value: string): Promise<Record<string, unknown>> {
  const raw = value.startsWith("@")
    ? await readFile(path.resolve(value.slice(1)), "utf-8").catch(() => {
        throw new CLIError(`Input file not found: ${value.slice(1)}`);
      })
    : value;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
    return parsed as Record<string, unknown>;
  } catch {
    throw new CLIError("Prediction input must be a JSON object or @path/to/input.json.");
  }
}

async function waitForPrediction(id: string, timeoutSeconds: number): Promise<Prediction> {
  const deadline = Date.now() + timeoutSeconds * 1000;
  while (Date.now() < deadline) {
    const prediction = await aiApiRequest<Prediction>("GET", `/predictions/${encodeURIComponent(id)}`);
    if (TERMINAL_STATUSES.has(prediction.status)) return prediction;
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  throw new CLIError(`Timed out waiting for prediction ${id}.`);
}

async function downloadOutputs(prediction: Prediction, directory: string): Promise<string[]> {
  const urls = outputUrls(prediction);
  if (urls.length === 0) throw new CLIError("Prediction completed without downloadable output URLs.");
  const outputDirectory = path.resolve(directory);
  await mkdir(outputDirectory, { recursive: true });
  const files: string[] = [];

  for (const [index, url] of urls.entries()) {
    const response = await fetch(url);
    if (!response.ok || !response.body) throw new CLIError(`Failed to download output: ${response.statusText}`);
    const urlName = path.basename(new URL(url).pathname);
    const filename = urlName || `${prediction.id}-${index + 1}`;
    const destination = path.join(outputDirectory, filename);
    await pipeline(Readable.fromWeb(response.body as never), createWriteStream(destination));
    files.push(destination);
  }
  return files;
}

const createCommand = new Command("create")
  .alias("run")
  .description("Create an image, video, or audio prediction")
  .argument("<model>", "Model namespace")
  .option("--input <json-or-file>", "Input JSON object or @path/to/input.json")
  .option("--prompt <text>", "Shortcut for --input with a prompt field")
  .option("--webhook <url>", "Webhook URL for prediction events")
  .option("--wait", "Wait for the prediction to finish")
  .option("--timeout <seconds>", "Maximum wait time", "900")
  .option("--output <directory>", "Wait and download outputs to a directory")
  .option("--json", "Output as JSON")
  .action(async (model: string, opts) => {
    if ((!opts.input && !opts.prompt) || (opts.input && opts.prompt)) {
      throw new CLIError("Provide exactly one of --input or --prompt.");
    }
    const timeoutSeconds = Number(opts.timeout);
    if (!Number.isFinite(timeoutSeconds) || timeoutSeconds <= 0) {
      throw new CLIError("Timeout must be a positive number of seconds.");
    }

    const body: PredictionCreateRequest = {
      model,
      input: opts.prompt ? { prompt: opts.prompt } : await parseInput(opts.input),
    };
    if (opts.webhook) body.webhook = opts.webhook;

    await requireApiKey();
    const progress = spinner("Creating prediction...");
    try {
      let prediction = await aiApiRequest<Prediction>("POST", "/predictions", body);
      if ((opts.wait || opts.output) && !TERMINAL_STATUSES.has(prediction.status)) {
        progress.text = "Waiting for prediction...";
        prediction = await waitForPrediction(prediction.id, timeoutSeconds);
      }

      let downloadedFiles: string[] = [];
      if (opts.output) {
        progress.text = "Downloading prediction outputs...";
        downloadedFiles = await downloadOutputs(prediction, opts.output);
      }
      progress.succeed("Prediction request complete.");

      if (opts.json) return jsonOutput(downloadedFiles.length ? { ...prediction, downloaded_files: downloadedFiles } : prediction);
      showPrediction(prediction);
      for (const file of downloadedFiles) success(`Downloaded ${file}`);
    } catch (error) {
      progress.fail("Prediction request failed.");
      throw error;
    }
  });

const getCommand = new Command("get")
  .alias("inspect")
  .description("Get a prediction by ID")
  .argument("<id>", "Prediction ID")
  .option("--json", "Output as JSON")
  .action(async (id: string, opts) => {
    await requireApiKey();
    const progress = spinner("Fetching prediction...");
    try {
      const prediction = await aiApiRequest<Prediction>("GET", `/predictions/${encodeURIComponent(id)}`);
      progress.stop();
      opts.json ? jsonOutput(prediction) : showPrediction(prediction);
    } catch (error) {
      progress.fail("Failed to fetch prediction.");
      throw error;
    }
  });

const listCommand = new Command("ls")
  .description("List recent predictions")
  .option("--model <slug>", "Filter by model namespace")
  .option("--status <status>", "Filter by prediction status")
  .option("--from <date>", "Start date (YYYY-MM-DD)")
  .option("--to <date>", "End date (YYYY-MM-DD)")
  .option("--page <n>", "Page number", "1")
  .option("--per-page <n>", "Results per page (1-50)", "20")
  .option("--json", "Output as JSON")
  .action(async (opts) => {
    const perPage = Number(opts.perPage);
    if (!Number.isInteger(perPage) || perPage < 1 || perPage > 50) throw new CLIError("--per-page must be between 1 and 50.");
    const query = new URLSearchParams({ page: opts.page, per_page: String(perPage) });
    for (const key of ["model", "status", "from", "to"] as const) if (opts[key]) query.set(key, opts[key]);

    await requireApiKey();
    const progress = spinner("Fetching predictions...");
    try {
      const response = await aiApiRequest<Prediction[] | { data: Prediction[] }>("GET", `/predictions?${query}`);
      progress.stop();
      const predictions = Array.isArray(response) ? response : response.data;
      if (opts.json) return jsonOutput(response);
      if (predictions.length === 0) return warn("No predictions found.");
      renderTable(
        ["ID", "Model", "Status", "Outputs", "Created"],
        predictions.map((prediction) => [
          prediction.id,
          modelName(prediction),
          predictionStatus(prediction.status),
          String(outputUrls(prediction).length),
          formatDate(prediction.created_at),
        ]),
      );
    } catch (error) {
      progress.fail("Failed to fetch predictions.");
      throw error;
    }
  });

const cancelCommand = new Command("cancel")
  .description("Cancel a queued or processing prediction")
  .argument("<id>", "Prediction ID")
  .option("--json", "Output as JSON")
  .action(async (id: string, opts) => {
    await requireApiKey();
    const progress = spinner("Canceling prediction...");
    try {
      const result = await aiApiRequest<{ success: boolean }>("POST", `/predictions/${encodeURIComponent(id)}/cancel`);
      progress.succeed("Prediction canceled.");
      if (opts.json) jsonOutput(result);
    } catch (error) {
      progress.fail("Failed to cancel prediction.");
      throw error;
    }
  });

const deleteCommand = new Command("rm")
  .aliases(["delete", "remove"])
  .description("Permanently delete a prediction")
  .argument("<id>", "Prediction ID")
  .option("-f, --force", "Skip confirmation prompt")
  .option("--json", "Output as JSON")
  .action(async (id: string, opts) => {
    if (!opts.force) {
      const approved = await confirm({ message: `Permanently delete prediction ${id}?`, default: false });
      if (!approved) return;
    }
    await requireApiKey();
    const progress = spinner("Deleting prediction...");
    try {
      const result = await aiApiRequest<{ success: boolean }>("DELETE", `/predictions/${encodeURIComponent(id)}`);
      progress.succeed("Prediction deleted.");
      if (opts.json) jsonOutput(result);
    } catch (error) {
      progress.fail("Failed to delete prediction.");
      throw error;
    }
  });

export const predictionsCommand = new Command("predictions")
  .description("Generate and manage image, video, and audio predictions");

predictionsCommand.addCommand(createCommand);
predictionsCommand.addCommand(getCommand);
predictionsCommand.addCommand(listCommand);
predictionsCommand.addCommand(cancelCommand);
predictionsCommand.addCommand(deleteCommand);