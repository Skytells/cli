import { Command } from "commander";
import { apiPut } from "../../lib/api.js";
import { CLI_API_PREFIX } from "../../lib/constants.js";
import { spinner, success, jsonOutput, error, bold } from "../../lib/ui.js";

export const envSetCommand = new Command("set")
  .description("Set environment variables (KEY=value ...)")
  .argument("<pairs...>", "KEY=value pairs")
  .option("--app <id>", "App ID or slug (omit for project-level)")
  .option("--json", "Output as JSON")
  .action(async (pairs: string[], opts) => {
    const envVars: Record<string, string> = {};

    for (const pair of pairs) {
      const eqIdx = pair.indexOf("=");
      if (eqIdx === -1) {
        error(`Invalid format '${pair}'. Use KEY=value.`);
        process.exit(1);
      }
      const key = pair.substring(0, eqIdx);
      const value = pair.substring(eqIdx + 1);
      envVars[key] = value;
    }

    const params: Record<string, string | undefined> = {};
    if (opts.app) params.app_slug = opts.app;

    const qs = opts.app ? `?app_slug=${encodeURIComponent(opts.app)}` : "";

    const s = spinner("Setting environment variables...");

    try {
      const result = await apiPut<Record<string, string>>(
        `${CLI_API_PREFIX}/env${qs}`,
        envVars,
      );
      s.succeed("Environment variables updated!");

      if (opts.json) {
        jsonOutput(result);
        return;
      }

      console.log();
      for (const key of Object.keys(envVars)) {
        console.log(`  ${bold(key)} set`);
      }
      console.log();
    } catch (err) {
      s.fail("Failed to set environment variables.");
      throw err;
    }
  });
