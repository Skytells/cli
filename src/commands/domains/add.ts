import { Command } from "commander";
import { apiPost } from "../../lib/api.js";
import { CLI_API_PREFIX } from "../../lib/constants.js";
import type { Domain } from "../../types/index.js";
import { spinner, success, bold, jsonOutput } from "../../lib/ui.js";

export const domainAddCommand = new Command("add")
  .description("Add a custom domain")
  .argument("<domain>", "Domain name")
  .option("--app <id>", "App ID to associate (UUID)")
  .option("--json", "Output as JSON")
  .action(async (domain: string, opts) => {
    const body: Record<string, string> = { domain: domain.trim() };
    if (opts.app) body.app_id = opts.app;

    const s = spinner("Adding domain...");

    try {
      const result = await apiPost<Domain>(`${CLI_API_PREFIX}/domains`, body);
      s.succeed("Domain added!");

      if (opts.json) {
        jsonOutput(result);
        return;
      }

      console.log();
      console.log(`  ${bold("ID:")}     ${result.id}`);
      console.log(`  ${bold("Domain:")} ${result.domain}`);
      if (result.app_id) {
        console.log(`  ${bold("App:")}    ${result.app_id}`);
      }
      console.log();
    } catch (err) {
      s.fail("Failed to add domain.");
      throw err;
    }
  });
