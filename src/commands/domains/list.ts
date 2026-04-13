import { Command } from "commander";
import { apiGet } from "../../lib/api.js";
import { CLI_API_PREFIX } from "../../lib/constants.js";
import type { Domain } from "../../types/index.js";
import { spinner, renderTable, jsonOutput, formatDate, warn } from "../../lib/ui.js";
import chalk from "chalk";

export const domainsListCommand = new Command("ls")
  .description("List all domains in the project")
  .option("--json", "Output as JSON")
  .action(async (opts) => {
    const s = spinner("Fetching domains...");

    try {
      const domains = await apiGet<Domain[]>(`${CLI_API_PREFIX}/domains`);
      s.stop();

      if (opts.json) {
        jsonOutput(domains);
        return;
      }

      if (domains.length === 0) {
        warn("No domains found.");
        return;
      }

      renderTable(
        ["ID", "Domain", "App ID", "Created"],
        domains.map((d) => [
          d.id,
          d.domain,
          d.app_id || chalk.dim("—"),
          formatDate(d.created_at),
        ]),
      );
    } catch (err) {
      s.fail("Failed to fetch domains.");
      throw err;
    }
  });
