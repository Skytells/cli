import { Command } from "commander";
import { apiGet } from "../../lib/api.js";
import { CLI_API_PREFIX } from "../../lib/constants.js";
import type { Instance } from "../../types/index.js";
import { spinner, renderTable, jsonOutput, formatDate, formatAppStatus, warn } from "../../lib/ui.js";
import chalk from "chalk";

export const cloudInstancesCommand = new Command("ls")
  .description("List cloud instances")
  .option("--json", "Output as JSON")
  .action(async (opts) => {
    const s = spinner("Fetching cloud instances...");

    try {
      const instances = await apiGet<Instance[]>(
        `${CLI_API_PREFIX}/cloud/instances`,
      );
      s.stop();

      if (opts.json) {
        jsonOutput(instances);
        return;
      }

      if (instances.length === 0) {
        warn("No cloud instances found.");
        return;
      }

      renderTable(
        ["ID", "Label", "Region", "Plan", "Status", "IP", "Created"],
        instances.map((i) => [
          i.id,
          i.label || chalk.dim("—"),
          i.region,
          i.plan,
          formatAppStatus(i.status),
          i.main_ip || chalk.dim("—"),
          formatDate(i.created_at),
        ]),
      );
    } catch (err) {
      s.fail("Failed to fetch cloud instances.");
      throw err;
    }
  });
