import { Command } from "commander";
import { apiPost } from "../../lib/api.js";
import { CLI_API_PREFIX } from "../../lib/constants.js";
import type { Database } from "../../types/index.js";
import { spinner, bold, jsonOutput, formatDate, formatDbType, error } from "../../lib/ui.js";

const VALID_TYPES = ["postgres", "mysql", "mariadb", "mongo", "redis"];

export const createDatabaseCommand = new Command("add")
  .description("Create a managed database")
  .argument("<name>", "Database name")
  .argument("<type>", `Database type (${VALID_TYPES.join(", ")})`)
  .option("--docker-image <image>", "Custom Docker image")
  .option("--description <desc>", "Description")
  .option("--password <password>", "Override default password")
  .option("--db-name <name>", "Override default database name")
  .option("--db-user <user>", "Override default user")
  .option("--json", "Output as JSON")
  .action(async (name: string, type: string, opts) => {
    if (!VALID_TYPES.includes(type)) {
      error(`Invalid database type '${type}'. Must be one of: ${VALID_TYPES.join(", ")}`);
      process.exit(1);
    }

    const body: Record<string, string> = {
      name: name.trim(),
      type,
    };
    if (opts.dockerImage) body.docker_image = opts.dockerImage;
    if (opts.description) body.description = opts.description;
    if (opts.password) body.database_password = opts.password;
    if (opts.dbName) body.database_name = opts.dbName;
    if (opts.dbUser) body.database_user = opts.dbUser;

    const s = spinner("Creating database...");

    try {
      const db = await apiPost<Database>(`${CLI_API_PREFIX}/databases`, body);
      s.succeed("Database created!");

      if (opts.json) {
        jsonOutput(db);
        return;
      }

      console.log();
      console.log(`  ${bold("ID:")}   ${db.id}`);
      console.log(`  ${bold("Name:")} ${db.name}`);
      console.log(`  ${bold("Type:")} ${formatDbType(db.type)}`);
      console.log(`  ${bold("Created:")} ${formatDate(db.created_at)}`);
      console.log();
    } catch (err) {
      s.fail("Failed to create database.");
      throw err;
    }
  });
