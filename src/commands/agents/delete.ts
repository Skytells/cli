import { Command } from "commander";
import { confirm } from "@inquirer/prompts";
import { apiDelete } from "../../lib/api.js";
import { CLI_API_PREFIX } from "../../lib/constants.js";
import { spinner, success } from "../../lib/ui.js";
import { CLIError } from "../../lib/errors.js";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validateUuid(id: string): void {
  if (!UUID_RE.test(id)) {
    throw new CLIError(`Invalid Agent ID format: "${id}". Expected a UUID.`);
  }
}

export const agentDeleteCommand = new Command("rm")
  .description("Delete a Cloud Agent")
  .argument("<id>", "Agent UUID")
  .option("-f, --force", "Skip confirmation prompt")
  .action(async (id: string, opts) => {
    validateUuid(id);

    if (!opts.force) {
      const ok = await confirm({
        message: `Permanently delete agent ${id}? Associated runs will be preserved.`,
        default: false,
      });
      if (!ok) return;
    }

    const s = spinner("Deleting agent...");

    try {
      await apiDelete<void>(
        `${CLI_API_PREFIX}/agents/${encodeURIComponent(id)}`,
        undefined,
        { auth: "user" },
      );
      s.succeed("Agent deleted.");
    } catch (err) {
      s.fail("Failed to delete agent.");
      throw err;
    }
  });
