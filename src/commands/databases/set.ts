import { Command } from "commander";
import { apiPatch } from "../../lib/api.js";
import { CLI_API_PREFIX } from "../../lib/constants.js";
import type { Database } from "../../types/index.js";
import { spinner, bold, jsonOutput, error } from "../../lib/ui.js";

export const databaseSetCommand = new Command("set")
  .description("Update a database setting")
  .argument("<id>", "Database ID")
  .argument("<field>", "Field to update (name, description, backup_enabled, backup_schedule, external_port)")
  .argument("<value>", "New value")
  .option("--json", "Output as JSON")
  .action(async (id: string, field: string, value: string, opts) => {
    const allowed = ["name", "description", "backup_enabled", "backup_schedule", "external_port"];
    if (!allowed.includes(field)) {
      error(`Invalid field '${field}'. Allowed: ${allowed.join(", ")}`);
      process.exit(1);
    }

    let parsed: unknown = value;
    if (field === "backup_enabled") {
      parsed = value === "true";
    } else if (field === "external_port") {
      parsed = value === "null" ? null : parseInt(value, 10);
    }

    const body: Record<string, unknown> = { [field]: parsed };

    const s = spinner("Updating database...");

    try {
      const db = await apiPatch<Database>(
        `${CLI_API_PREFIX}/databases/${encodeURIComponent(id)}`,
        body,
      );
      s.succeed("Database updated!");

      if (opts.json) {
        jsonOutput(db);
        return;
      }

      console.log();
      console.log(`  ${bold(field)} set to ${bold(value)}`);
      console.log();
    } catch (err) {
      s.fail("Failed to update database.");
      throw err;
    }
  });
