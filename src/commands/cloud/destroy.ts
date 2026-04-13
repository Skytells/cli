import { Command } from "commander";
import { confirm } from "@inquirer/prompts";
import { apiDelete } from "../../lib/api.js";
import { CLI_API_PREFIX } from "../../lib/constants.js";
import type { DeleteResponse } from "../../types/index.js";
import { spinner, success, jsonOutput } from "../../lib/ui.js";

export const cloudDestroyCommand = new Command("destroy")
  .description("Destroy a cloud instance")
  .argument("<id>", "Instance ID")
  .option("-f, --force", "Skip confirmation prompt")
  .option("--json", "Output as JSON")
  .action(async (id: string, opts) => {
    if (!opts.force) {
      const ok = await confirm({
        message: `Permanently destroy cloud instance ${id}? This cannot be undone.`,
        default: false,
      });
      if (!ok) return;
    }

    const s = spinner("Destroying cloud instance...");

    try {
      const data = await apiDelete<DeleteResponse>(
        `${CLI_API_PREFIX}/cloud/instances/${encodeURIComponent(id)}`,
      );
      s.succeed("Cloud instance destroyed.");

      if (opts.json) {
        jsonOutput(data);
      }
    } catch (err) {
      s.fail("Failed to destroy cloud instance.");
      throw err;
    }
  });
