import { Command } from "commander";
import { apiGet } from "../../lib/api.js";
import { CLI_API_PREFIX } from "../../lib/constants.js";
import type { Agent } from "../../types/index.js";
import { spinner, renderTable, jsonOutput, formatDate, warn } from "../../lib/ui.js";
import chalk from "chalk";

function formatAgentType(type: string): string {
  switch (type) {
    case "review":
      return chalk.blue(type);
    case "execute":
      return chalk.green(type);
    case "hybrid":
      return chalk.magenta(type);
    case "custom":
      return chalk.yellow(type);
    default:
      return chalk.dim(type);
  }
}

function formatActive(isActive: boolean): string {
  return isActive ? chalk.green("active") : chalk.dim("inactive");
}

export const agentsListCommand = new Command("ls")
  .description("List all Cloud Agents")
  .option("--json", "Output as JSON")
  .action(async (opts) => {
    const s = spinner("Fetching agents...");

    try {
      const agents = await apiGet<Agent[]>(
        `${CLI_API_PREFIX}/agents`,
        undefined,
        { auth: "user" },
      );
      s.stop();

      if (opts.json) {
        jsonOutput(agents);
        return;
      }

      if (agents.length === 0) {
        warn("No agents found.");
        return;
      }

      renderTable(
        ["ID", "Name", "Type", "Status", "Repos", "Created"],
        agents.map((a) => [
          a.id,
          a.name,
          formatAgentType(a.type),
          formatActive(a.is_active),
          String(a.repo_binding?.length ?? 0),
          formatDate(a.created_at),
        ]),
      );
    } catch (err) {
      s.fail("Failed to fetch agents.");
      throw err;
    }
  });
