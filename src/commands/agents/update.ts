import { Command } from "commander";
import { apiPut } from "../../lib/api.js";
import { CLI_API_PREFIX } from "../../lib/constants.js";
import type { Agent, AgentUpdateRequest, AgentType } from "../../types/index.js";
import { spinner, success, bold, jsonOutput } from "../../lib/ui.js";
import { CLIError } from "../../lib/errors.js";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const VALID_TYPES: AgentType[] = ["review", "execute", "hybrid", "custom"];

function validateUuid(id: string): void {
  if (!UUID_RE.test(id)) {
    throw new CLIError(`Invalid Agent ID format: "${id}". Expected a UUID.`);
  }
}

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

export const agentUpdateCommand = new Command("set")
  .description("Update a Cloud Agent")
  .argument("<id>", "Agent UUID")
  .option("--name <name>", "New name (1–100 chars)")
  .option("--description <desc>", "New description (1–500 chars)")
  .option("--type <type>", `New type: ${VALID_TYPES.join(" | ")}`)
  .option("--model <model_id>", "Model ID (e.g. gpt-4o)")
  .option("--capabilities <tags>", "Comma-separated capability tags")
  .option("--repos <repos>", "Comma-separated full repo bindings (replaces list)")
  .option("--active", "Set agent to active")
  .option("--inactive", "Set agent to inactive")
  .option("--json", "Output as JSON")
  .action(async (id: string, opts) => {
    validateUuid(id);

    const body: AgentUpdateRequest = {};

    if (opts.name) {
      const name = opts.name.trim();
      if (name.length < 1 || name.length > 100) {
        throw new CLIError("Agent name must be between 1 and 100 characters.");
      }
      body.name = name;
    }

    if (opts.description) {
      const desc = opts.description.trim();
      if (desc.length < 1 || desc.length > 500) {
        throw new CLIError(
          "Agent description must be between 1 and 500 characters.",
        );
      }
      body.description = desc;
    }

    if (opts.type) {
      if (!VALID_TYPES.includes(opts.type as AgentType)) {
        throw new CLIError(
          `Invalid agent type "${opts.type}". Must be one of: ${VALID_TYPES.join(", ")}.`,
        );
      }
      body.type = opts.type as AgentType;
    }

    if (opts.model) {
      body.config = { model_id: opts.model };
    }

    if (opts.capabilities) {
      body.capabilities = opts.capabilities
        .split(",")
        .map((c: string) => c.trim())
        .filter(Boolean);
    }

    if (opts.repos) {
      const repos = opts.repos
        .split(",")
        .map((r: string) => r.trim())
        .filter(Boolean);
      validateRepoFormat(repos);
      body.repo_binding = repos;
    }

    if (opts.active && opts.inactive) {
      throw new CLIError("Cannot set --active and --inactive at the same time.");
    }
    if (opts.active) body.is_active = true;
    if (opts.inactive) body.is_active = false;

    if (Object.keys(body).length === 0) {
      throw new CLIError("No fields specified to update.");
    }

    const s = spinner("Updating agent...");

    try {
      const agent = await apiPut<Agent>(
        `${CLI_API_PREFIX}/agents/${encodeURIComponent(id)}`,
        body,
        { auth: "user" },
      );
      s.succeed("Agent updated!");

      if (opts.json) {
        jsonOutput(agent);
        return;
      }

      console.log();
      console.log(`  ${bold("ID:")}   ${agent.id}`);
      console.log(`  ${bold("Name:")} ${agent.name}`);
      console.log();
    } catch (err) {
      s.fail("Failed to update agent.");
      throw err;
    }
  });
