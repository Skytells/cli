import { Command } from "commander";
import { apiGet } from "../../lib/api.js";
import { CLI_API_PREFIX } from "../../lib/constants.js";
import type { ExecutionDetail } from "../../types/index.js";
import { spinner, jsonOutput, renderTable, info, bold } from "../../lib/ui.js";
import chalk from "chalk";

export const orchestratorInspectCommand = new Command("inspect")
  .description("View execution details and logs")
  .argument("<id>", "Execution ID")
  .option("--json", "Output as JSON")
  .action(async (id: string, opts) => {
    const s = spinner("Fetching execution...");

    try {
      const detail = await apiGet<ExecutionDetail>(
        `${CLI_API_PREFIX}/orchestrator/executions/${encodeURIComponent(id)}`,
        undefined,
        { auth: "user" },
      );
      s.stop();

      if (opts.json) {
        jsonOutput(detail);
        return;
      }

      const exec = detail.execution;
      console.log();
      info(`${bold("ID:")}     ${exec.id}`);
      info(`${bold("Status:")} ${exec.status}`);

      if (detail.logs && detail.logs.length > 0) {
        console.log();
        info(bold("Logs:"));
        renderTable(
          ["Node", "Status", "Input", "Output"],
          detail.logs.map((l) => [
            l.nodeId,
            l.status === "success" ? chalk.green(l.status) : chalk.red(l.status),
            l.input ?? chalk.dim("—"),
            l.output ?? chalk.dim("—"),
          ]),
        );
      }
      console.log();
    } catch (err) {
      s.fail("Failed to fetch execution.");
      throw err;
    }
  });
