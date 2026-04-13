import { Command } from "commander";
import { apiPost } from "../../lib/api.js";
import { CLI_API_PREFIX } from "../../lib/constants.js";
import type { App } from "../../types/index.js";
import { spinner, success, bold, jsonOutput, formatDate } from "../../lib/ui.js";

export const createAppCommand = new Command("add")
  .description("Create a new app in the project")
  .argument("<name>", "App name")
  .option("--type <type>", "App type (application, docker_image, compose)")
  .option("--json", "Output as JSON")
  .action(async (name: string, opts) => {
    const body: Record<string, string> = { name: name.trim() };
    if (opts.type) body.app_type = opts.type;

    const s = spinner("Creating app...");

    try {
      const app = await apiPost<App>(`${CLI_API_PREFIX}/apps`, body);
      s.succeed("App created!");

      if (opts.json) {
        jsonOutput(app);
        return;
      }

      console.log();
      console.log(`  ${bold("ID:")}   ${app.id}`);
      console.log(`  ${bold("Name:")} ${app.name}`);
      console.log(`  ${bold("Slug:")} ${app.slug}`);
      console.log(`  ${bold("Type:")} ${app.app_type}`);
      console.log(`  ${bold("Created:")} ${formatDate(app.created_at)}`);
      console.log();
    } catch (err) {
      s.fail("Failed to create app.");
      throw err;
    }
  });
