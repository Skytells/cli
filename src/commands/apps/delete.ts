import { Command } from "commander";
import { confirm } from "@inquirer/prompts";
import { apiDelete } from "../../lib/api.js";
import { CLI_API_PREFIX } from "../../lib/constants.js";
import type { DeleteResponse } from "../../types/index.js";
import { spinner, success, jsonOutput } from "../../lib/ui.js";

export const appDeleteCommand = new Command("rm")
  .description("Delete an app")
  .argument("<id>", "App ID or slug")
  .option("-f, --force", "Skip confirmation prompt")
  .option("--json", "Output as JSON")
  .action(async (id: string, opts) => {
    if (!opts.force) {
      const ok = await confirm({
        message: `Permanently delete app ${id}? This cannot be undone.`,
        default: false,
      });
      if (!ok) return;
    }

    const s = spinner("Deleting app...");

    try {
      const data = await apiDelete<DeleteResponse>(
        `${CLI_API_PREFIX}/apps/${encodeURIComponent(id)}`,
      );
      s.succeed("App deleted.");

      if (opts.json) {
        jsonOutput(data);
      }
    } catch (err) {
      s.fail("Failed to delete app.");
      throw err;
    }
  });
