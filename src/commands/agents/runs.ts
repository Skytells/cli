import { Command } from "commander";
import { apiGet, apiPost } from "../../lib/api.js";
import { CLI_API_PREFIX } from "../../lib/constants.js";
import type { AgentRun, AgentRunEnvelope, AgentRunCreateRequest, RunType } from "../../types/index.js";
import {
  spinner,
  renderTable,
  jsonOutput,
  formatDate,
  warn,
  bold,
  dim,
} from "../../lib/ui.js";
import { CLIError } from "../../lib/errors.js";
import chalk from "chalk";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const REPO_RE = /^[a-zA-Z0-9_.\-]+\/[a-zA-Z0-9_.\-]+$/;
const VALID_RUN_TYPES: RunType[] = ["review", "execute", "investigate"];
const VALID_STATUSES = [
  "queued",
  "running",
  "awaiting_approval",
  "approved",
  "completed",
  "failed",
  "cancelled",
] as const;

function validateUuid(id: string, label = "ID"): void {
  if (!UUID_RE.test(id)) {
    throw new CLIError(`Invalid ${label} format: "${id}". Expected a UUID.`);
  }
}

function formatRunStatus(status: string): string {
  switch (status) {
    case "completed":
      return chalk.green(status);
    case "failed":
      return chalk.red(status);
    case "running":
      return chalk.cyan(status);
    case "queued":
      return chalk.dim(status);
    case "cancelled":
      return chalk.yellow(status);
    case "awaiting_approval":
      return chalk.yellow("awaiting approval");
    case "approved":
      return chalk.blue(status);
    default:
      return chalk.dim(status);
  }
}

// ── List runs (cross-agent) ────────────────────────────────────

const runsListAllCommand = new Command("ls")
  .description("List all runs across all agents")
  .option("--agent <id>", "Filter by agent UUID")
  .option("--status <status>", `Filter by status: ${VALID_STATUSES.join(", ")}`)
  .option("--run-type <type>", `Filter by run type: ${VALID_RUN_TYPES.join(", ")}`)
  .option("--trigger <source>", "Filter by trigger source (github, console, slack, chat)")
  .option("--page <n>", "Page number", "1")
  .option("--per-page <n>", "Results per page (max 100)", "20")
  .option("--json", "Output as JSON")
  .action(async (opts) => {
    if (opts.status && !VALID_STATUSES.includes(opts.status as typeof VALID_STATUSES[number])) {
      throw new CLIError(
        `Invalid status "${opts.status}". Must be one of: ${VALID_STATUSES.join(", ")}.`,
      );
    }
    if (opts.runType && !VALID_RUN_TYPES.includes(opts.runType as RunType)) {
      throw new CLIError(
        `Invalid run type "${opts.runType}". Must be one of: ${VALID_RUN_TYPES.join(", ")}.`,
      );
    }

    let url: string;
    const params: Record<string, string | number | undefined> = {
      page: Number(opts.page),
      per_page: Math.min(Number(opts.perPage), 100),
    };

    if (opts.agent) {
      validateUuid(opts.agent, "Agent ID");
      url = `${CLI_API_PREFIX}/agents/${encodeURIComponent(opts.agent)}/runs`;
    } else {
      url = `${CLI_API_PREFIX}/agents/runs`;
      if (opts.trigger) params.trigger_source = opts.trigger;
    }

    if (opts.status) params.status = opts.status;
    if (opts.runType) params.run_type = opts.runType;

    const s = spinner("Fetching runs...");

    try {
      const envelope = await apiGet<AgentRunEnvelope>(url, params, {
        auth: "user",
      });
      s.stop();

      const runs = envelope.data;
      const meta = envelope.meta;

      if (opts.json) {
        jsonOutput(envelope);
        return;
      }

      if (runs.length === 0) {
        warn("No runs found.");
        return;
      }

      renderTable(
        ["ID", "Type", "Status", "Repo", "PR", "Created"],
        runs.map((r) => [
          r.id,
          r.run_type,
          formatRunStatus(r.status),
          r.repo_full_name,
          r.pr_number != null ? String(r.pr_number) : dim("—"),
          formatDate(r.created_at),
        ]),
      );

      if (meta) {
        console.log(
          dim(`  Page ${meta.page} · ${runs.length} of ${meta.total} total`),
        );
      }
    } catch (err) {
      s.fail("Failed to fetch runs.");
      throw err;
    }
  });

// ── Inspect a single run ──────────────────────────────────────

const runsInspectCommand = new Command("inspect")
  .description("Show full details of a run")
  .argument("<run-id>", "Run UUID")
  .option("--json", "Output as JSON")
  .action(async (runId: string, opts) => {
    validateUuid(runId, "Run ID");

    const s = spinner("Fetching run...");

    try {
      const run = await apiGet<AgentRun>(
        `${CLI_API_PREFIX}/agents/runs/${encodeURIComponent(runId)}`,
        undefined,
        { auth: "user" },
      );
      s.stop();

      if (opts.json) {
        jsonOutput(run);
        return;
      }

      console.log();
      console.log(`  ${bold("ID:")}             ${run.id}`);
      console.log(`  ${bold("Type:")}           ${run.run_type}`);
      console.log(`  ${bold("Status:")}         ${formatRunStatus(run.status)}`);
      console.log(`  ${bold("Trigger:")}        ${run.trigger_source}`);
      console.log(`  ${bold("Repo:")}           ${run.repo_full_name}`);
      if (run.branch) console.log(`  ${bold("Branch:")}         ${run.branch}`);
      if (run.pr_number != null) {
        console.log(`  ${bold("PR:")}             #${run.pr_number}`);
      }
      if (run.commit_sha) {
        console.log(`  ${bold("Commit:")}         ${run.commit_sha}`);
      }
      console.log(
        `  ${bold("Tokens in:")}      ${run.tokens_input.toLocaleString()}`,
      );
      console.log(
        `  ${bold("Tokens out:")}     ${run.tokens_output.toLocaleString()}`,
      );
      if (run.result_summary) {
        console.log(`  ${bold("Summary:")}`);
        console.log();
        console.log(
          run.result_summary
            .split("\n")
            .map((l) => `    ${l}`)
            .join("\n"),
        );
      }
      if (run.error_code) {
        console.log(`  ${bold("Error code:")}     ${chalk.red(run.error_code)}`);
      }
      if (run.error_message) {
        console.log(`  ${bold("Error:")}          ${chalk.red(run.error_message)}`);
      }
      console.log(`  ${bold("Created:")}        ${formatDate(run.created_at)}`);
      if (run.completed_at) {
        console.log(`  ${bold("Completed:")}      ${formatDate(run.completed_at)}`);
      }
      console.log();
    } catch (err) {
      s.fail("Failed to fetch run.");
      throw err;
    }
  });

// ── Create a run ──────────────────────────────────────────────

const runsCreateCommand = new Command("run")
  .description("Create and enqueue a new run for an agent")
  .argument("<agent-id>", "Agent UUID")
  .requiredOption(
    "--type <run_type>",
    `Run type: ${VALID_RUN_TYPES.join(" | ")}`,
  )
  .requiredOption("--repo <repo>", "Repository in owner/repo format")
  .option("--branch <branch>", "Target branch")
  .option("--pr <number>", "Pull request number (required for review/investigate)", parseInt)
  .option("--prompt <text>", "Instruction prompt (required for execute; 1–4000 chars)")
  .option("--json", "Output as JSON")
  .action(async (agentId: string, opts) => {
    validateUuid(agentId, "Agent ID");

    const runType = opts.type as RunType;
    if (!VALID_RUN_TYPES.includes(runType)) {
      throw new CLIError(
        `Invalid run type "${runType}". Must be one of: ${VALID_RUN_TYPES.join(", ")}.`,
      );
    }

    const REPO_RE = /^[a-zA-Z0-9_.\-]+\/[a-zA-Z0-9_.\-]+$/;
    if (!REPO_RE.test(opts.repo)) {
      throw new CLIError(
        `Invalid repo format: "${opts.repo}". Expected "owner/repo".`,
      );
    }

    if ((runType === "review" || runType === "investigate") && opts.pr == null) {
      throw new CLIError(`--pr is required for "${runType}" run type.`);
    }

    if (runType === "execute" && !opts.prompt) {
      throw new CLIError(`--prompt is required for "${runType}" run type.`);
    }

    if (opts.prompt && (opts.prompt.length < 1 || opts.prompt.length > 4000)) {
      throw new CLIError("Prompt must be between 1 and 4000 characters.");
    }

    const body: AgentRunCreateRequest = {
      run_type: runType,
      repo_full_name: opts.repo,
    };

    if (opts.branch) body.branch = opts.branch;
    if (opts.pr != null) body.pr_number = opts.pr;
    if (opts.prompt) body.prompt = opts.prompt;

    const s = spinner("Enqueueing run...");

    try {
      const run = await apiPost<AgentRun>(
        `${CLI_API_PREFIX}/agents/${encodeURIComponent(agentId)}/runs`,
        body,
        { auth: "user" },
      );
      s.succeed("Run accepted and queued!");

      if (opts.json) {
        jsonOutput(run);
        return;
      }

      console.log();
      console.log(`  ${bold("Run ID:")} ${run.id}`);
      console.log(`  ${bold("Type:")}   ${run.run_type}`);
      console.log(`  ${bold("Status:")} ${formatRunStatus(run.status)}`);
      console.log(`  ${bold("Repo:")}   ${run.repo_full_name}`);
      if (run.pr_number != null) {
        console.log(`  ${bold("PR:")}     #${run.pr_number}`);
      }
      console.log(`  ${bold("Created:")} ${formatDate(run.created_at)}`);
      console.log();
    } catch (err) {
      s.fail("Failed to create run.");
      throw err;
    }
  });

// ── Runs group ────────────────────────────────────────────────

export const agentRunsCommand = new Command("runs")
  .description("Manage Cloud Agent runs");

agentRunsCommand.addCommand(runsListAllCommand);   // skytells agents runs ls [--agent <id>]
agentRunsCommand.addCommand(runsInspectCommand);   // skytells agents runs inspect <run-id>
agentRunsCommand.addCommand(runsCreateCommand);    // skytells agents runs run <agent-id>
