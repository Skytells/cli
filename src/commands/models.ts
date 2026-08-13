import { Command } from "commander";
import chalk from "chalk";
import { aiApiRequest, requireApiKey } from "../lib/ai-api.js";
import { spinner, renderTable, jsonOutput, warn, bold, dim } from "../lib/ui.js";
import type { Model } from "../types/index.js";

const listCommand = new Command("ls")
  .description("List models available to your API key")
  .option("--type <type>", "Filter by model type (image, video, audio, text)")
  .option("--json", "Output as JSON")
  .action(async (opts) => {
    await requireApiKey();
    const progress = spinner("Fetching models...");
    try {
      let models = await aiApiRequest<Model[]>("GET", "/models");
      progress.stop();
      if (opts.type) models = models.filter((model) => model.type === opts.type);
      if (opts.json) return jsonOutput(models);
      if (models.length === 0) return warn("No models found.");

      renderTable(
        ["Namespace", "Name", "Type", "Status", "Price", "Capabilities"],
        models.map((model) => [
          model.namespace,
          model.name,
          model.type,
          model.status === "operational" ? chalk.green(model.status) : chalk.yellow(model.status),
          model.pricing?.amount != null
            ? `${model.pricing.amount} ${model.pricing.currency ?? ""}/${model.pricing.unit ?? "unit"}`
            : dim("—"),
          model.capabilities?.join(", ") ?? dim("—"),
        ]),
      );
    } catch (error) {
      progress.fail("Failed to fetch models.");
      throw error;
    }
  });

const inspectCommand = new Command("inspect")
  .alias("view")
  .description("Show model details and optional input/output schemas")
  .argument("<slug>", "Model namespace")
  .option("--schemas", "Include input and output JSON Schemas")
  .option("--json", "Output as JSON")
  .action(async (slug: string, opts) => {
    await requireApiKey();
    const fields = opts.schemas ? "?fields=input_schema,output_schema" : "";
    const progress = spinner("Fetching model...");
    try {
      const model = await aiApiRequest<Model>("GET", `/models/${encodeURIComponent(slug)}${fields}`);
      progress.stop();
      if (opts.json) return jsonOutput(model);

      console.log();
      console.log(`  ${bold("Name:")}         ${model.name}`);
      console.log(`  ${bold("Namespace:")}    ${model.namespace}`);
      console.log(`  ${bold("Type:")}         ${model.type}`);
      console.log(`  ${bold("Status:")}       ${model.status}`);
      if (model.description) console.log(`  ${bold("Description:")}  ${model.description}`);
      if (model.capabilities?.length) console.log(`  ${bold("Capabilities:")} ${model.capabilities.join(", ")}`);
      if (model.pricing) console.log(`  ${bold("Pricing:")}      ${model.pricing.amount ?? "—"} ${model.pricing.currency ?? ""}/${model.pricing.unit ?? "unit"}`);
      if (opts.schemas) {
        console.log(`  ${bold("Input schema:")}`);
        console.log(JSON.stringify(model.input_schema ?? {}, null, 2));
        console.log(`  ${bold("Output schema:")}`);
        console.log(JSON.stringify(model.output_schema ?? {}, null, 2));
      }
      console.log();
    } catch (error) {
      progress.fail("Failed to fetch model.");
      throw error;
    }
  });

export const modelsCommand = new Command("models")
  .description("Discover AI models available to your API key");

modelsCommand.addCommand(listCommand);
modelsCommand.addCommand(inspectCommand);