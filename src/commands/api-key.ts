import { Command } from "commander";
import { confirm } from "@inquirer/prompts";
import { deleteApiKey, loadApiKey } from "../lib/config.js";
import { promptAndSaveApiKey } from "../lib/ai-api.js";
import { success, warn, info, dim } from "../lib/ui.js";

const setCommand = new Command("set")
  .alias("update")
  .description("Authenticate or update the Skytells API key")
  .action(async () => {
    await promptAndSaveApiKey();
    success("Skytells API key configured.");
  });

const statusCommand = new Command("status")
  .description("Show whether a Skytells API key is configured")
  .action(() => {
    const key = loadApiKey();
    if (!key) {
      warn("No Skytells API key is configured.");
      return;
    }
    const source = process.env.SKYTELLS_API_KEY ? "SKYTELLS_API_KEY" : "credentials file";
    info(`API key configured via ${source}: ${dim(`${key.slice(0, 7)}...${key.slice(-4)}`)}`);
  });

const removeCommand = new Command("rm")
  .aliases(["remove", "delete"])
  .description("Delete the stored Skytells API key")
  .option("-f, --force", "Skip confirmation prompt")
  .action(async (opts) => {
    if (process.env.SKYTELLS_API_KEY) {
      warn("SKYTELLS_API_KEY is set in the environment and cannot be removed by the CLI.");
      return;
    }
    if (!loadApiKey()) {
      warn("No stored Skytells API key was found.");
      return;
    }
    if (!opts.force) {
      const approved = await confirm({
        message: "Delete the stored Skytells API key?",
        default: false,
      });
      if (!approved) return;
    }
    if (deleteApiKey()) success("Stored Skytells API key deleted.");
  });

export const apiKeyCommand = new Command("api-key")
  .description("Manage the Skytells API key used for models and predictions");

apiKeyCommand.addCommand(setCommand);
apiKeyCommand.addCommand(statusCommand);
apiKeyCommand.addCommand(removeCommand);