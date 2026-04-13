import { Command } from "commander";
import { apiGet } from "../../lib/api.js";
import { CLI_API_PREFIX } from "../../lib/constants.js";
import type { OrchestratorUsage } from "../../types/index.js";
import { spinner, jsonOutput, renderTable, info, bold } from "../../lib/ui.js";

export const orchestratorUsageCommand = new Command("usage")
  .description("Show usage statistics")
  .option("--from <date>", "Start date (ISO string)")
  .option("--to <date>", "End date (ISO string)")
  .option("--json", "Output as JSON")
  .action(async (opts) => {
    const s = spinner("Fetching usage...");

    try {
      const params: Record<string, string> = {};
      if (opts.from) params.from = opts.from;
      if (opts.to) params.to = opts.to;

      const usage = await apiGet<OrchestratorUsage>(
        `${CLI_API_PREFIX}/orchestrator/usage`,
        params,
        { auth: "user" },
      );
      s.stop();

      if (opts.json) {
        jsonOutput(usage);
        return;
      }

      console.log();
      info(`${bold("Total Executions:")} ${usage.totalExecutions}`);
      info(`${bold("Success Rate:")}     ${(usage.successRate * 100).toFixed(1)}%`);

      if (usage.byWorkflow && usage.byWorkflow.length > 0) {
        console.log();
        info(bold("By Workflow:"));
        renderTable(
          ["Workflow", "Name", "Executions"],
          usage.byWorkflow.map((w) => [
            w.workflowId,
            w.workflowName,
            String(w.executionCount),
          ]),
        );
      }
      console.log();
    } catch (err) {
      s.fail("Failed to fetch usage.");
      throw err;
    }
  });
