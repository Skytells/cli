import { Command } from "commander";
import { confirm } from "@inquirer/prompts";
import { deleteToken, hasToken } from "../../lib/config.js";
import { success, warn } from "../../lib/ui.js";

export const logoutCommand = new Command("logout")
  .description("Log out and remove stored credentials")
  .option("-f, --force", "Skip confirmation prompt")
  .action(async (opts) => {
    if (!hasToken()) {
      warn("You are not currently logged in.");
      return;
    }

    if (!opts.force) {
      const ok = await confirm({
        message: "Are you sure you want to log out?",
        default: false,
      });
      if (!ok) return;
    }

    deleteToken();
    success("Logged out. Credentials removed.");
  });
