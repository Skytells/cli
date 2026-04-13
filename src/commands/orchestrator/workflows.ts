import { Command } from "commander";
import { apiGet } from "../../lib/api.js";
import { CLI_API_PREFIX } from "../../lib/constants.js";
import type { Workflow } from "../../types/index.js";
import { spinner, renderTable, jsonOutput, warn } from "../../lib/ui.js";

export const orchestratorWorkflowsCommand = new Command("ls")
  .description("List workflows")
  .option("--json", "Output as JSON")
  .action(async (opts) => {
    const s = spinner("Fetching workflows...");

    try {
      const workflows = await apiGet<Workflow[]>(
        `${CLI_API_PREFIX}/orchestrator/workflows`,
        undefined,
        { auth: "user" },
      );
      s.stop();

      if (opts.json) {
        jsonOutput(workflows);
        return;
      }

      if (!Array.isArray(workflows) || workflows.length === 0) {
        warn("No workflows found.");
        return;
      }

      renderTable(
        ["ID", "Name"],
        workflows.map((w) => [w.id, w.name]),
      );
    } catch (err) {
      s.fail("Failed to fetch workflows.");
      throw err;
    }
  });
