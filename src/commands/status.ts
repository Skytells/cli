import { Command } from "commander";
import { apiGet } from "../lib/api.js";
import { CLI_API_PREFIX } from "../lib/constants.js";
import type { StatusOverview } from "../types/index.js";
import { spinner, jsonOutput, bold, dim} from "../lib/ui.js";

export const statusCommand = new Command("status")
  .description("Get project and app status overview")
  .option("--json", "Output as JSON")
  .action(async (opts) => {
    const s = spinner("Fetching status...");

    try {
      const status = await apiGet<StatusOverview>(`${CLI_API_PREFIX}/status`);
      s.stop();

      if (opts.json) {
        jsonOutput(status);
        return;
      }

      console.log();
      if (status.project) {
        for (const [key, value] of Object.entries(status.project)) {
          console.log(`  ${bold(key + ":")} ${value}`);
        }
      }

      if (status.apps && Array.isArray(status.apps)) {
        console.log();
        console.log(`  ${bold("Apps:")}`);
        for (const app of status.apps) {
          const name = (app as Record<string, unknown>).name || (app as Record<string, unknown>).slug || "unknown";
          const appStatus = (app as Record<string, unknown>).status || (app as Record<string, unknown>).unified_status || "unknown";
          console.log(`    ${name}: ${appStatus}`);
        }
      }
      console.log();
    } catch (err) {
      s.fail("Failed to fetch status.");
      throw err;
    }
  });
