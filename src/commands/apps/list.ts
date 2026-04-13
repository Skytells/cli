import { Command } from "commander";
import { apiGet } from "../../lib/api.js";
import { CLI_API_PREFIX } from "../../lib/constants.js";
import type { App } from "../../types/index.js";
import {
  spinner,
  renderTable,
  jsonOutput,
  formatDate,
  formatAppStatus,
  warn,
} from "../../lib/ui.js";
import chalk from "chalk";

export const appsListCommand = new Command("ls")
  .description("List all apps in the project")
  .option("--json", "Output as JSON")
  .action(async (opts) => {
    const s = spinner("Fetching apps...");

    try {
      const apps = await apiGet<App[]>(`${CLI_API_PREFIX}/apps`);
      s.stop();

      if (opts.json) {
        jsonOutput(apps);
        return;
      }

      if (apps.length === 0) {
        warn("No apps found.");
        return;
      }

      renderTable(
        ["ID", "Name", "Slug", "Type", "Status", "Created"],
        apps.map((a) => [
          a.id,
          a.name,
          a.slug,
          a.app_type || chalk.dim("—"),
          formatAppStatus(a.unified_status || a.status),
          formatDate(a.created_at),
        ]),
      );
    } catch (err) {
      s.fail("Failed to fetch apps.");
      throw err;
    }
  });
