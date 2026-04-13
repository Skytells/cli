import { Command } from "commander";
import { apiGet } from "../../lib/api.js";
import { CLI_API_PREFIX } from "../../lib/constants.js";
import { spinner, jsonOutput, warn, bold, dim } from "../../lib/ui.js";

export const envGetCommand = new Command("ls")
  .description("List environment variables")
  .option("--app <id>", "App ID or slug (omit for project-level)")
  .option("--json", "Output as JSON")
  .action(async (opts) => {
    const s = spinner("Fetching environment variables...");

    try {
      const params: Record<string, string | undefined> = {};
      if (opts.app) params.app_slug = opts.app;

      const envVars = await apiGet<Record<string, string>>(
        `${CLI_API_PREFIX}/env`,
        params,
      );
      s.stop();

      if (opts.json) {
        jsonOutput(envVars);
        return;
      }

      const entries = Object.entries(envVars);
      if (entries.length === 0) {
        warn("No environment variables found.");
        return;
      }

      console.log();
      for (const [key, value] of entries) {
        console.log(`  ${bold(key)}=${value}`);
      }
      console.log();
    } catch (err) {
      s.fail("Failed to fetch environment variables.");
      throw err;
    }
  });
