import { Command } from "commander";
import { apiPost } from "../../lib/api.js";
import { CLI_API_PREFIX } from "../../lib/constants.js";
import type { Agent, AgentCreateRequest, AgentType } from "../../types/index.js";
import { spinner, bold, jsonOutput, formatDate } from "../../lib/ui.js";
import { CLIError } from "../../lib/errors.js";
import chalk from "chalk";

const VALID_TYPES: AgentType[] = ["review", "execute", "hybrid", "custom"];

function validateRepoFormat(repos: string[]): void {
  const REPO_RE = /^[a-zA-Z0-9_.\-]+\/[a-zA-Z0-9_.\-]+$/;
  for (const r of repos) {
    if (!REPO_RE.test(r)) {
      throw new CLIError(
        `Invalid repo format: "${r}". Expected "owner/repo".`,
      );
    }
  }
  if (repos.length > 50) {
    throw new CLIError("Cannot bind more than 50 repositories to an agent.");
  }
}

export const agentCreateCommand = new Command("add")
  .description("Create a new Cloud Agent")
  .requiredOption("--name <name>", "Agent name (1–100 chars)")
  .requiredOption("--description <desc>", "Agent description (1–500 chars)")
  .requiredOption(
    "--type <type>",
    `Agent type: ${VALID_TYPES.join(" | ")}`,
  )
  .option("--model <model_id>", "Model ID (e.g. gpt-4o)")
  .option("--capabilities <tags>", "Comma-separated capability tags")
  .option("--repos <repos>", "Comma-separated repo bindings (owner/repo)")
  .option("--inactive", "Create agent in inactive state")
  .option("--json", "Output as JSON")
  .action(async (opts) => {
    const name = opts.name.trim();
    const description = opts.description.trim();
    const type = opts.type as AgentType;

    if (name.length < 1 || name.length > 100) {
      throw new CLIError("Agent name must be between 1 and 100 characters.");
    }
    if (description.length < 1 || description.length > 500) {
      throw new CLIError(
        "Agent description must be between 1 and 500 characters.",
      );
    }
    if (!VALID_TYPES.includes(type)) {
      throw new CLIError(
        `Invalid agent type "${type}". Must be one of: ${VALID_TYPES.join(", ")}.`,
      );
    }

    const repos = opts.repos
      ? opts.repos.split(",").map((r: string) => r.trim()).filter(Boolean)
      : undefined;

    if (repos) validateRepoFormat(repos);

    const body: AgentCreateRequest = {
      name,
      description,
      type,
      is_active: !opts.inactive,
    };

    if (opts.model) body.config = { model_id: opts.model };
    if (opts.capabilities) {
      body.capabilities = opts.capabilities
        .split(",")
        .map((c: string) => c.trim())
        .filter(Boolean);
    }
    if (repos) body.repo_binding = repos;

    const s = spinner("Creating agent...");

    try {
      const agent = await apiPost<Agent>(
        `${CLI_API_PREFIX}/agents`,
        body,
        { auth: "user" },
      );
      s.succeed("Agent created!");

      if (opts.json) {
        jsonOutput(agent);
        return;
      }

      console.log();
      console.log(`  ${bold("ID:")}     ${agent.id}`);
      console.log(`  ${bold("Name:")}   ${agent.name}`);
      console.log(`  ${bold("Type:")}   ${agent.type}`);
      console.log(
        `  ${bold("Status:")} ${agent.is_active ? chalk.green("active") : chalk.dim("inactive")}`,
      );
      console.log(`  ${bold("Created:")} ${formatDate(agent.created_at)}`);
      console.log();
    } catch (err) {
      s.fail("Failed to create agent.");
      throw err;
    }
  });
