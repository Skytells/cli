import { Command } from "commander";
import { apiPost } from "../lib/api.js";
import { CLI_API_PREFIX } from "../lib/constants.js";
import type { Deployment } from "../types/index.js";
import { spinner, success, bold, jsonOutput, formatDate, formatDeploymentStatus } from "../lib/ui.js";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const deployCommand = new Command("deploy")
  .description("Trigger a deployment for an app")
  .argument("<app>", "App ID or slug")
  .option("--json", "Output as JSON")
  .action(async (app: string, opts) => {
    const body: Record<string, string> = UUID_RE.test(app)
      ? { app_id: app }
      : { app_slug: app };

    const s = spinner("Deploying...");

    try {
      const deployment = await apiPost<Deployment>(
        `${CLI_API_PREFIX}/deploy`,
        body,
      );
      s.succeed("Deployment triggered!");

      if (opts.json) {
        jsonOutput(deployment);
        return;
      }

      console.log();
      console.log(`  ${bold("Deployment ID:")} ${deployment.id}`);
      console.log(`  ${bold("Status:")}        ${formatDeploymentStatus(deployment.status)}`);
      console.log(`  ${bold("Created:")}       ${formatDate(deployment.created_at)}`);
      console.log();
    } catch (err) {
      s.fail("Deployment failed.");
      throw err;
    }
  });
