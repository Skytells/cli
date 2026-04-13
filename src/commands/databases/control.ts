import { Command } from "commander";
import { confirm } from "@inquirer/prompts";
import { apiPost } from "../../lib/api.js";
import { CLI_API_PREFIX } from "../../lib/constants.js";
import type { ControlResponse } from "../../types/index.js";
import { spinner, success, jsonOutput } from "../../lib/ui.js";

function makeDbControlCommand(
  actionName: string,
  description: string,
  defaultConfirm: boolean = true,
): Command {
  return new Command(actionName)
    .description(description)
    .argument("<id>", "Database ID")
    .option("-f, --force", "Skip confirmation prompt")
    .option("--json", "Output as JSON")
    .action(async (id: string, opts) => {
      if (!opts.force) {
        const ok = await confirm({
          message: `${actionName.charAt(0).toUpperCase() + actionName.slice(1)} database ${id}?`,
          default: defaultConfirm,
        });
        if (!ok) return;
      }

      const s = spinner(`${actionName.charAt(0).toUpperCase() + actionName.slice(1)}ing database...`);

      try {
        const data = await apiPost<ControlResponse>(
          `${CLI_API_PREFIX}/databases/${encodeURIComponent(id)}/control`,
          { action: actionName },
        );
        s.succeed(`Database ${actionName} successful.`);

        if (opts.json) {
          jsonOutput(data);
        }
      } catch (err) {
        s.fail(`Failed to ${actionName} database.`);
        throw err;
      }
    });
}

export const dbStartCommand = makeDbControlCommand("start", "Start a database");
export const dbStopCommand = makeDbControlCommand("stop", "Stop a database", false);
export const dbDeployCommand = makeDbControlCommand("deploy", "Deploy a database");
