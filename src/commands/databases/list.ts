import { Command } from "commander";
import { apiGet } from "../../lib/api.js";
import { CLI_API_PREFIX } from "../../lib/constants.js";
import type { Database } from "../../types/index.js";
import {
  spinner,
  renderTable,
  jsonOutput,
  formatDate,
  formatDbType,
  formatAppStatus,
  warn,
} from "../../lib/ui.js";
import chalk from "chalk";

export const databasesListCommand = new Command("ls")
  .description("List all databases in the project")
  .option("--json", "Output as JSON")
  .action(async (opts) => {
    const s = spinner("Fetching databases...");

    try {
      const databases = await apiGet<Database[]>(`${CLI_API_PREFIX}/databases`);
      s.stop();

      if (opts.json) {
        jsonOutput(databases);
        return;
      }

      if (databases.length === 0) {
        warn("No databases found.");
        return;
      }

      renderTable(
        ["ID", "Name", "Type", "Status", "External Port", "Created"],
        databases.map((d) => [
          d.id,
          d.name,
          formatDbType(d.type),
          formatAppStatus(d.status),
          d.external_port?.toString() || chalk.dim("—"),
          formatDate(d.created_at),
        ]),
      );
    } catch (err) {
      s.fail("Failed to fetch databases.");
      throw err;
    }
  });
