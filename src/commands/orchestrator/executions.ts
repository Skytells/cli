import { Command } from "commander";
import { apiGet } from "../../lib/api.js";
import { CLI_API_PREFIX } from "../../lib/constants.js";
import type { Execution } from "../../types/index.js";
import { spinner, renderTable, jsonOutput, warn } from "../../lib/ui.js";
import chalk from "chalk";

function formatExecStatus(status: string): string {
  switch (status) {
    case "success":
      return chalk.green(status);
    case "error":
      return chalk.red(status);
    case "running":
      return chalk.cyan(status);
    case "pending":
      return chalk.yellow(status);
    default:
      return chalk.dim(status);
  }
}

export const orchestratorExecutionsCommand = new Command("executions")
  .description("List workflow executions")
  .option("--workflow <id>", "Filter by workflow ID")
  .option("--status <status>", "Filter by status (pending/running/success/error)")
  .option("--limit <n>", "Page size", "20")
  .option("--offset <n>", "Pagination offset", "0")
  .option("--json", "Output as JSON")
  .action(async (opts) => {
    const s = spinner("Fetching executions...");

    try {
      const params: Record<string, string> = {
        limit: opts.limit,
        offset: opts.offset,
      };
      if (opts.workflow) params.workflow_id = opts.workflow;
      if (opts.status) params.status = opts.status;

      const res = await apiGet<{ data: Execution[]; total: number }>(
        `${CLI_API_PREFIX}/orchestrator/executions`,
        params,
        { auth: "user" },
      );
      s.stop();

      if (opts.json) {
        jsonOutput(res);
        return;
      }

      const executions = res.data ?? (res as unknown as Execution[]);
      if (!Array.isArray(executions) || executions.length === 0) {
        warn("No executions found.");
        return;
      }

      renderTable(
        ["ID", "Status"],
        executions.map((e) => [e.id, formatExecStatus(e.status)]),
      );
    } catch (err) {
      s.fail("Failed to fetch executions.");
      throw err;
    }
  });
