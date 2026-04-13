import { Command } from "commander";
import { confirm } from "@inquirer/prompts";
import { apiDelete } from "../../lib/api.js";
import { CLI_API_PREFIX } from "../../lib/constants.js";
import type { DeleteResponse } from "../../types/index.js";
import { spinner, success, jsonOutput } from "../../lib/ui.js";

export const domainRemoveCommand = new Command("rm")
  .description("Remove a custom domain")
  .argument("<id>", "Domain ID")
  .option("-f, --force", "Skip confirmation prompt")
  .option("--json", "Output as JSON")
  .action(async (id: string, opts) => {
    if (!opts.force) {
      const ok = await confirm({
        message: `Remove domain ${id}?`,
        default: false,
      });
      if (!ok) return;
    }

    const s = spinner("Removing domain...");

    try {
      const data = await apiDelete<DeleteResponse>(
        `${CLI_API_PREFIX}/domains/${encodeURIComponent(id)}`,
      );
      s.succeed("Domain removed.");

      if (opts.json) {
        jsonOutput(data);
      }
    } catch (err) {
      s.fail("Failed to remove domain.");
      throw err;
    }
  });
