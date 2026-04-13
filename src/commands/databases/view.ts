import { Command } from "commander";
import { apiGet } from "../../lib/api.js";
import { CLI_API_PREFIX } from "../../lib/constants.js";
import type { Database } from "../../types/index.js";
import { spinner, bold, dim, jsonOutput, formatDate, formatDbType, formatAppStatus } from "../../lib/ui.js";

export const databaseViewCommand = new Command("inspect")
  .description("View details of a database")
  .argument("<id>", "Database ID")
  .option("--json", "Output as JSON")
  .action(async (id: string, opts) => {
    const s = spinner("Fetching database...");

    try {
      const db = await apiGet<Database>(
        `${CLI_API_PREFIX}/databases/${encodeURIComponent(id)}`,
      );
      s.stop();

      if (opts.json) {
        jsonOutput(db);
        return;
      }

      console.log();
      console.log(`  ${bold("ID:")}            ${db.id}`);
      console.log(`  ${bold("Name:")}          ${db.name}`);
      console.log(`  ${bold("Type:")}          ${formatDbType(db.type)}`);
      console.log(`  ${bold("Description:")}   ${db.description || dim("none")}`);
      console.log(`  ${bold("Status:")}        ${formatAppStatus(db.status)}`);
      console.log(`  ${bold("External Port:")} ${db.external_port?.toString() || dim("none")}`);
      console.log(`  ${bold("Backup:")}        ${db.backup_enabled ? "enabled" : dim("disabled")}`);
      if (db.backup_schedule) {
        console.log(`  ${bold("Backup Cron:")}   ${db.backup_schedule}`);
      }
      console.log(`  ${bold("Created:")}       ${formatDate(db.created_at)}`);
      console.log();
    } catch (err) {
      s.fail("Failed to fetch database.");
      throw err;
    }
  });
