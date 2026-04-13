import { Command } from "commander";
import { apiPost } from "../../lib/api.js";
import { CLI_API_PREFIX } from "../../lib/constants.js";
import type { Project } from "../../types/index.js";
import { spinner, success, bold, jsonOutput, formatDate, dim } from "../../lib/ui.js";

export const createProjectCommand = new Command("add")
  .description("Create a new project")
  .argument("<name>", "Project name")
  .option("--type <type>", "Project type (e.g. web, ml)")
  .option("--json", "Output as JSON")
  .action(async (name: string, opts) => {
    const body: Record<string, string> = { name: name.trim() };
    if (opts.type) body.type = opts.type;

    const s = spinner("Creating project...");

    try {
      const project = await apiPost<Project>(
        `${CLI_API_PREFIX}/projects`,
        body,
        { auth: "user" },
      );
      s.succeed("Project created!");

      if (opts.json) {
        jsonOutput(project);
        return;
      }

      console.log();
      console.log(`  ${bold("ID:")}     ${project.id}`);
      console.log(`  ${bold("Name:")}   ${project.name}`);
      console.log(`  ${bold("Slug:")}   ${project.slug}`);
      if (project.type) {
        console.log(`  ${bold("Type:")}   ${project.type}`);
      }
      console.log(`  ${bold("Status:")} ${project.status}`);
      console.log(`  ${bold("Created:")} ${formatDate(project.created_at)}`);
      console.log();
    } catch (err) {
      s.fail("Failed to create project.");
      throw err;
    }
  });
