import { Command } from "commander";
import { confirm } from "@inquirer/prompts";
import { apiDelete } from "../../lib/api.js";
import { CLI_API_PREFIX } from "../../lib/constants.js";
import type { DeleteResponse } from "../../types/index.js";
import { spinner, success, jsonOutput } from "../../lib/ui.js";

export const databaseDeleteCommand = new Command("rm")
  .description("Delete a database")
  .argument("<id>", "Database ID")
  .option("-f, --force", "Skip confirmation prompt")
  .option("--json", "Output as JSON")
  .action(async (id: string, opts) => {
    if (!opts.force) {
      const ok = await confirm({
        message: `Permanently delete database ${id}? This cannot be undone.`,
        default: false,
      });
      if (!ok) return;
    }

    const s = spinner("Deleting database...");

    try {
      const data = await apiDelete<DeleteResponse>(
        `${CLI_API_PREFIX}/databases/${encodeURIComponent(id)}`,
      );
      s.succeed("Database deleted.");

      if (opts.json) {
        jsonOutput(data);
      }
    } catch (err) {
      s.fail("Failed to delete database.");
      throw err;
    }
  });
