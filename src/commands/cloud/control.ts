import { Command } from "commander";
import { confirm } from "@inquirer/prompts";
import { apiPost } from "../../lib/api.js";
import { CLI_API_PREFIX } from "../../lib/constants.js";
import { spinner, success, jsonOutput } from "../../lib/ui.js";

function makeCloudControlCommand(
  actionName: string,
  endpoint: string,
  description: string,
  defaultConfirm: boolean = true,
): Command {
  return new Command(actionName)
    .description(description)
    .argument("<id>", "Instance ID")
    .option("-f, --force", "Skip confirmation prompt")
    .option("--json", "Output as JSON")
    .action(async (id: string, opts) => {
      if (!opts.force) {
        const ok = await confirm({
          message: `${actionName.charAt(0).toUpperCase() + actionName.slice(1)} cloud instance ${id}?`,
          default: defaultConfirm,
        });
        if (!ok) return;
      }

      const label = actionName.charAt(0).toUpperCase() + actionName.slice(1);
      const s = spinner(`${label}ing cloud instance...`);

      try {
        const data = await apiPost<{ status: string }>(
          `${CLI_API_PREFIX}/cloud/instances/${encodeURIComponent(id)}/${endpoint}`,
          {},
        );
        s.succeed(`Cloud instance ${actionName} successful.`);

        if (opts.json) {
          jsonOutput(data);
        }
      } catch (err) {
        s.fail(`Failed to ${actionName} cloud instance.`);
        throw err;
      }
    });
}

export const cloudStartCommand = makeCloudControlCommand("start", "start", "Start a cloud instance");
export const cloudHaltCommand = makeCloudControlCommand("halt", "halt", "Halt a cloud instance", false);
export const cloudRebootCommand = makeCloudControlCommand("reboot", "reboot", "Reboot a cloud instance");
