import { Command } from "commander";
import { apiGet } from "../../lib/api.js";
import { CLI_API_PREFIX } from "../../lib/constants.js";
import type { App } from "../../types/index.js";
import { spinner, bold, dim, jsonOutput, formatDate, formatAppStatus } from "../../lib/ui.js";

export const appViewCommand = new Command("inspect")
  .description("View details of an app")
  .argument("<id>", "App ID or slug")
  .option("--json", "Output as JSON")
  .action(async (id: string, opts) => {
    const s = spinner("Fetching app...");

    try {
      const app = await apiGet<App>(
        `${CLI_API_PREFIX}/apps/${encodeURIComponent(id)}`,
      );
      s.stop();

      if (opts.json) {
        jsonOutput(app);
        return;
      }

      console.log();
      console.log(`  ${bold("ID:")}         ${app.id}`);
      console.log(`  ${bold("Name:")}       ${app.name}`);
      console.log(`  ${bold("Slug:")}       ${app.slug}`);
      console.log(`  ${bold("Type:")}       ${app.app_type}`);
      if (app.build_type) {
        console.log(`  ${bold("Build:")}      ${app.build_type}`);
      }
      console.log(`  ${bold("Status:")}     ${formatAppStatus(app.unified_status || app.status)}`);
      if (app.repository_url) {
        console.log(`  ${bold("Repo:")}       ${app.repository_url}`);
      }
      if (app.branch) {
        console.log(`  ${bold("Branch:")}     ${app.branch}`);
      }
      if (app.docker_image) {
        console.log(`  ${bold("Image:")}      ${app.docker_image}`);
      }
      console.log(`  ${bold("Created:")}    ${formatDate(app.created_at)}`);
      console.log(`  ${bold("Updated:")}    ${formatDate(app.updated_at)}`);
      console.log();
    } catch (err) {
      s.fail("Failed to fetch app.");
      throw err;
    }
  });
