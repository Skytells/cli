import { Command } from "commander";
import { apiGet } from "../../lib/api.js";
import { CLI_API_PREFIX } from "../../lib/constants.js";
import type { ExecutionMetrics } from "../../types/index.js";
import { spinner, jsonOutput, info, bold } from "../../lib/ui.js";

export const orchestratorMetricsCommand = new Command("metrics")
  .description("Show execution metrics")
  .option("--from <date>", "Start date (ISO string)")
  .option("--to <date>", "End date (ISO string)")
  .option("--json", "Output as JSON")
  .action(async (opts) => {
    const s = spinner("Fetching metrics...");

    try {
      const params: Record<string, string> = {};
      if (opts.from) params.from = opts.from;
      if (opts.to) params.to = opts.to;

      const metrics = await apiGet<ExecutionMetrics>(
        `${CLI_API_PREFIX}/orchestrator/executions/metrics`,
        params,
        { auth: "user" },
      );
      s.stop();

      if (opts.json) {
        jsonOutput(metrics);
        return;
      }

      console.log();
      info(`${bold("Total:")}          ${metrics.total}`);
      info(`${bold("Success:")}        ${metrics.success}`);
      info(`${bold("Error:")}          ${metrics.error}`);
      info(`${bold("Pending:")}        ${metrics.pending}`);
      info(`${bold("Running:")}        ${metrics.running}`);
      info(`${bold("Avg Duration:")}   ${metrics.avgDurationMs}ms`);
      console.log();
    } catch (err) {
      s.fail("Failed to fetch metrics.");
      throw err;
    }
  });
