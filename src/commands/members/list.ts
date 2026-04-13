import { Command } from "commander";
import { apiGet } from "../../lib/api.js";
import { CLI_API_PREFIX } from "../../lib/constants.js";
import type { Member } from "../../types/index.js";
import { spinner, renderTable, jsonOutput, formatDate, warn } from "../../lib/ui.js";
import chalk from "chalk";

export const membersListCommand = new Command("ls")
  .description("List project team members")
  .option("--json", "Output as JSON")
  .action(async (opts) => {
    const s = spinner("Fetching members...");

    try {
      const members = await apiGet<Member[]>(`${CLI_API_PREFIX}/members`);
      s.stop();

      if (opts.json) {
        jsonOutput(members);
        return;
      }

      if (members.length === 0) {
        warn("No members found.");
        return;
      }

      renderTable(
        ["User ID", "Role", "Email", "Name", "Joined"],
        members.map((m) => [
          m.user_id,
          m.role === "owner" ? chalk.yellow(m.role) : m.role,
          m.email || chalk.dim("—"),
          m.name || chalk.dim("—"),
          formatDate(m.joined_at),
        ]),
      );
    } catch (err) {
      s.fail("Failed to fetch members.");
      throw err;
    }
  });
