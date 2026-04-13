import { Command } from "commander";
import { confirm } from "@inquirer/prompts";
import { apiPost } from "../../lib/api.js";
import { CLI_API_PREFIX } from "../../lib/constants.js";
import type { ControlResponse } from "../../types/index.js";
import { spinner, success, bold, jsonOutput } from "../../lib/ui.js";

function makeControlCommand(
  actionName: string,
  description: string,
  defaultConfirm: boolean = true,
): Command {
  return new Command(actionName)
    .description(description)
    .argument("<app>", "App ID or slug")
    .option("-f, --force", "Skip confirmation prompt")
    .option("--json", "Output as JSON")
    .action(async (app: string, opts) => {
      if (!opts.force) {
        const ok = await confirm({
          message: `${actionName.charAt(0).toUpperCase() + actionName.slice(1)} app ${app}?`,
          default: defaultConfirm,
        });
        if (!ok) return;
      }

      const s = spinner(`${actionName.charAt(0).toUpperCase() + actionName.slice(1)}ing app...`);

      try {
        const data = await apiPost<ControlResponse>(
          `${CLI_API_PREFIX}/apps/${encodeURIComponent(app)}/control`,
          { action: actionName },
        );
        s.succeed(`App ${actionName} successful.`);

        if (data.deployment_id) {
          console.log(`  ${bold("Deployment ID:")} ${data.deployment_id}`);
        }

        if (opts.json) {
          jsonOutput(data);
        }
      } catch (err) {
        s.fail(`Failed to ${actionName} app.`);
        throw err;
      }
    });
}

export const startCommand = makeControlCommand("start", "Start an app");
export const stopCommand = makeControlCommand("stop", "Stop an app", false);
export const restartCommand = makeControlCommand("restart", "Restart an app");
export const redeployCommand = makeControlCommand("redeploy", "Redeploy an app");
