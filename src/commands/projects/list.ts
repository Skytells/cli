import { Command } from "commander";
import { apiGet } from "../../lib/api.js";
import { CLI_API_PREFIX } from "../../lib/constants.js";
import type { Project } from "../../types/index.js";
import {
  spinner,
  renderTable,
  jsonOutput,
  formatDate,
  warn,
} from "../../lib/ui.js";
import chalk from "chalk";

export const projectsListCommand = new Command("ls")
  .description("List all projects")
  .option("--type <type>", "Filter by project type (e.g. web, ml)")
  .option("--json", "Output as JSON")
  .action(async (opts) => {
    const s = spinner("Fetching projects...");

    try {
      const params: Record<string, string | undefined> = {};
      if (opts.type) params.type = opts.type;

      const projects = await apiGet<Project[]>(
        `${CLI_API_PREFIX}/projects`,
        params,
        { auth: "user" },
      );
      s.stop();

      if (opts.json) {
        jsonOutput(projects);
        return;
      }

      if (projects.length === 0) {
        warn("No projects found.");
        return;
      }

      renderTable(
        ["ID", "Name", "Slug", "Type", "Status", "Created"],
        projects.map((p) => [
          p.id,
          p.name,
          p.slug,
          p.type || chalk.dim("—"),
          p.status === "active" ? chalk.green(p.status) : chalk.dim(p.status),
          formatDate(p.created_at),
        ]),
      );
    } catch (err) {
      s.fail("Failed to fetch projects.");
      throw err;
    }
  });
