import { Command } from "commander";
import { apiGet } from "../../lib/api.js";
import { CLI_API_PREFIX } from "../../lib/constants.js";
import type { Agent } from "../../types/index.js";
import { spinner, bold, jsonOutput, formatDate, info } from "../../lib/ui.js";
import chalk from "chalk";
import { CLIError } from "../../lib/errors.js";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validateUuid(id: string, label = "Agent ID"): void {
  if (!UUID_RE.test(id)) {
    throw new CLIError(`Invalid ${label} format: "${id}". Expected a UUID.`);
  }
}

export const agentViewCommand = new Command("inspect")
  .description("Show details of a Cloud Agent")
  .argument("<id>", "Agent UUID")
  .option("--json", "Output as JSON")
  .action(async (id: string, opts) => {
    validateUuid(id);

    const s = spinner("Fetching agent...");

    try {
      const agent = await apiGet<Agent>(
        `${CLI_API_PREFIX}/agents/${encodeURIComponent(id)}`,
        undefined,
        { auth: "user" },
      );
      s.stop();

      if (opts.json) {
        jsonOutput(agent);
        return;
      }

      console.log();
      console.log(`  ${bold("ID:")}          ${agent.id}`);
      console.log(`  ${bold("Name:")}        ${agent.name}`);
      console.log(`  ${bold("Description:")} ${agent.description}`);
      console.log(`  ${bold("Type:")}        ${agent.type}`);
      console.log(
        `  ${bold("Status:")}      ${agent.is_active ? chalk.green("active") : chalk.dim("inactive")}`,
      );
      if (agent.capabilities?.length) {
        console.log(`  ${bold("Capabilities:")} ${agent.capabilities.join(", ")}`);
      }
      if (agent.config && Object.keys(agent.config).length) {
        console.log(
          `  ${bold("Config:")}      ${JSON.stringify(agent.config)}`,
        );
      }
      if (agent.repo_binding?.length) {
        console.log(`  ${bold("Repos:")}       ${agent.repo_binding.join(", ")}`);
      }
      console.log(`  ${bold("Created:")}     ${formatDate(agent.created_at)}`);
      console.log(`  ${bold("Updated:")}     ${formatDate(agent.updated_at)}`);
      console.log();

      if (agent.pinned_prompts?.length) {
        info(`Pinned prompts (${agent.pinned_prompts.length}):`);
        for (const p of agent.pinned_prompts) {
          console.log(`  ${bold(p.label)}: ${p.content.slice(0, 80)}${p.content.length > 80 ? "…" : ""}`);
        }
        console.log();
      }
    } catch (err) {
      s.fail("Failed to fetch agent.");
      throw err;
    }
  });
