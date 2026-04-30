import { Command } from "commander";
import { apiGet, apiPost, apiDelete } from "../../lib/api.js";
import { CLI_API_PREFIX } from "../../lib/constants.js";
import { spinner, success, warn, jsonOutput, renderTable } from "../../lib/ui.js";
import { CLIError } from "../../lib/errors.js";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const REPO_RE = /^[a-zA-Z0-9_.\-]+\/[a-zA-Z0-9_.\-]+$/;

function validateUuid(id: string): void {
  if (!UUID_RE.test(id)) {
    throw new CLIError(`Invalid Agent ID format: "${id}". Expected a UUID.`);
  }
}

function validateRepoFormat(repo: string): void {
  if (!REPO_RE.test(repo)) {
    throw new CLIError(
      `Invalid repo format: "${repo}". Expected "owner/repo".`,
    );
  }
}

// ── List repos ────────────────────────────────────────────────

const reposListCommand = new Command("ls")
  .description("List repository bindings for an agent")
  .argument("<agent-id>", "Agent UUID")
  .option("--json", "Output as JSON")
  .action(async (agentId: string, opts) => {
    validateUuid(agentId);

    const s = spinner("Fetching repo bindings...");

    try {
      const repos = await apiGet<string[]>(
        `${CLI_API_PREFIX}/agents/${encodeURIComponent(agentId)}/repos`,
        undefined,
        { auth: "user" },
      );
      s.stop();

      if (opts.json) {
        jsonOutput(repos);
        return;
      }

      if (repos.length === 0) {
        warn("No repositories bound to this agent.");
        return;
      }

      renderTable(["Repository"], repos.map((r) => [r]));
    } catch (err) {
      s.fail("Failed to fetch repo bindings.");
      throw err;
    }
  });

// ── Add repos ─────────────────────────────────────────────────

const reposAddCommand = new Command("add")
  .description("Add repositories to an agent's binding list")
  .argument("<agent-id>", "Agent UUID")
  .argument("<repos...>", "Repositories in owner/repo format")
  .option("--json", "Output as JSON")
  .action(async (agentId: string, repos: string[], opts) => {
    validateUuid(agentId);

    for (const r of repos) {
      validateRepoFormat(r);
    }

    const s = spinner("Adding repositories...");

    try {
      const updated = await apiPost<string[]>(
        `${CLI_API_PREFIX}/agents/${encodeURIComponent(agentId)}/repos`,
        { repos },
        { auth: "user" },
      );
      s.succeed(`Added ${repos.length} repo(s). Total bound: ${updated.length}.`);

      if (opts.json) {
        jsonOutput(updated);
      }
    } catch (err) {
      s.fail("Failed to add repositories.");
      throw err;
    }
  });

// ── Remove repo ───────────────────────────────────────────────

const reposRemoveCommand = new Command("rm")
  .description("Remove a repository from an agent's binding list")
  .argument("<agent-id>", "Agent UUID")
  .argument("<repo>", "Repository to remove (owner/repo)")
  .option("--json", "Output as JSON")
  .action(async (agentId: string, repo: string, opts) => {
    validateUuid(agentId);
    validateRepoFormat(repo);

    const s = spinner("Removing repository...");

    try {
      const updated = await apiDelete<string[]>(
        `${CLI_API_PREFIX}/agents/${encodeURIComponent(agentId)}/repos`,
        { repo_full_name: repo },
        { auth: "user" },
      );
      s.succeed(`Repository "${repo}" removed.`);

      if (opts.json) {
        jsonOutput(updated);
      }
    } catch (err) {
      s.fail("Failed to remove repository.");
      throw err;
    }
  });

// ── Repos group ───────────────────────────────────────────────

export const agentReposCommand = new Command("repos")
  .description("Manage repository bindings for a Cloud Agent");

agentReposCommand.addCommand(reposListCommand);
agentReposCommand.addCommand(reposAddCommand);
agentReposCommand.addCommand(reposRemoveCommand);
