import { Command } from "commander";
import { apiGet } from "../../lib/api.js";
import { CLI_API_PREFIX } from "../../lib/constants.js";
import type { Project } from "../../types/index.js";
import { spinner, info, bold, dim, jsonOutput, formatDate } from "../../lib/ui.js";
import chalk from "chalk";

export const projectViewCommand = new Command("project")
  .description("View the linked project")
  .option("--json", "Output as JSON")
  .action(async (opts) => {
    const s = spinner("Fetching project...");

    try {
      const project = await apiGet<Project>(`${CLI_API_PREFIX}/project`);
      s.stop();

      if (opts.json) {
        jsonOutput(project);
        return;
      }

      console.log();
      console.log(`  ${bold("ID:")}           ${project.id}`);
      console.log(`  ${bold("Name:")}         ${project.name}`);
      console.log(`  ${bold("Slug:")}         ${project.slug}`);
      console.log(
        `  ${bold("Description:")}  ${project.description || dim("none")}`,
      );
      if (project.type) {
        console.log(`  ${bold("Type:")}         ${project.type}`);
      }
      if (project.network_mode) {
        console.log(`  ${bold("Network:")}      ${project.network_mode}`);
      }
      console.log(
        `  ${bold("Status:")}       ${project.status === "active" ? chalk.green(project.status) : chalk.dim(project.status)}`,
      );
      console.log(`  ${bold("Created:")}      ${formatDate(project.created_at)}`);
      console.log(`  ${bold("Updated:")}      ${formatDate(project.updated_at)}`);
      console.log();
    } catch (err) {
      s.fail("Failed to fetch project.");
      throw err;
    }
  });
