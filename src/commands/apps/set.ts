import { Command } from "commander";
import { apiPatch } from "../../lib/api.js";
import { CLI_API_PREFIX } from "../../lib/constants.js";
import type { App } from "../../types/index.js";
import { spinner, success, bold, jsonOutput } from "../../lib/ui.js";

export const appSetCommand = new Command("set")
  .description("Update an app setting")
  .argument("<id>", "App ID or slug")
  .argument("<field>", "Field to update")
  .argument("<value>", "New value")
  .option("--json", "Output as JSON")
  .action(async (id: string, field: string, value: string, opts) => {
    const body: Record<string, unknown> = { [field]: value };

    const s = spinner("Updating app...");

    try {
      const app = await apiPatch<App>(
        `${CLI_API_PREFIX}/apps/${encodeURIComponent(id)}`,
        body,
      );
      s.succeed("App updated!");

      if (opts.json) {
        jsonOutput(app);
        return;
      }

      console.log();
      console.log(`  ${bold(field)} set to ${bold(value)}`);
      console.log();
    } catch (err) {
      s.fail("Failed to update app.");
      throw err;
    }
  });
