import { Command } from "commander";
import { apiGet } from "../../lib/api.js";
import { CLI_API_PREFIX } from "../../lib/constants.js";
import type { CognitionTimeseries } from "../../types/index.js";
import { spinner, jsonOutput, info, bold } from "../../lib/ui.js";

export const cognitionTimeseriesCommand = new Command("timeseries")
  .description("Show time-series data")
  .requiredOption("--project <id>", "Project ID or slug")
  .option("--hours <n>", "Lookback window in hours (max 720)", "24")
  .option("--json", "Output as JSON")
  .action(async (opts) => {
    const s = spinner("Fetching timeseries...");

    try {
      const data = await apiGet<CognitionTimeseries>(
        `${CLI_API_PREFIX}/cognition/timeseries`,
        { project_id: opts.project, hours: opts.hours },
        { auth: "user" },
      );
      s.stop();

      if (opts.json) {
        jsonOutput(data);
        return;
      }

      console.log();
      for (const [key, value] of Object.entries(data)) {
        if (Array.isArray(value)) {
          info(`${bold(key + ":")} ${value.length} data points`);
        } else if (typeof value === "object") {
          info(`${bold(key + ":")} ${JSON.stringify(value)}`);
        } else {
          info(`${bold(key + ":")} ${value}`);
        }
      }
      console.log();
    } catch (err) {
      s.fail("Failed to fetch timeseries.");
      throw err;
    }
  });
