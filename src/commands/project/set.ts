import { Command } from "commander";
import { apiPatch } from "../../lib/api.js";
import { CLI_API_PREFIX } from "../../lib/constants.js";
import type { Project } from "../../types/index.js";
import { spinner, success, bold, jsonOutput, error } from "../../lib/ui.js";

export const projectSetCommand = new Command("set")
  .description("Update a project setting")
  .argument("<field>", "Field to update (name, description, network_mode)")
  .argument("<value>", "New value")
  .option("--json", "Output as JSON")
  .action(async (field: string, value: string, opts) => {
    const allowed = ["name", "description", "network_mode"];
    if (!allowed.includes(field)) {
      error(`Invalid field '${field}'. Allowed: ${allowed.join(", ")}`);
      process.exit(1);
    }

    const body: Record<string, unknown> = { [field]: value };

    const s = spinner("Updating project...");

    try {
      const project = await apiPatch<Project>(
        `${CLI_API_PREFIX}/project`,
        body,
      );
      s.succeed("Project updated!");

      if (opts.json) {
        jsonOutput(project);
        return;
      }

      console.log();
      console.log(`  ${bold(field)} set to ${bold(value)}`);
      console.log();
    } catch (err) {
      s.fail("Failed to update project.");
      throw err;
    }
  });
