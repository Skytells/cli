import { Command } from "commander";
import { saveAccessKey, getCredentialsFilePath } from "../lib/config.js";
import { ACCESS_KEY_PREFIX, CLI_API_PREFIX } from "../lib/constants.js";
import { apiGet } from "../lib/api.js";
import type { Project } from "../types/index.js";
import { spinner, success, error, info, dim, bold } from "../lib/ui.js";

export const linkCommand = new Command("link")
  .description("Link an access key to this CLI for project-scoped operations")
  .argument("<access-key>", "Project access key (sk_proj_...)")
  .action(async (accessKey: string) => {
    const trimmed = accessKey.trim();

    if (!trimmed.startsWith(ACCESS_KEY_PREFIX)) {
      error(
        `Invalid access key format. Keys start with '${ACCESS_KEY_PREFIX}'.`,
      );
      process.exit(1);
    }

    saveAccessKey(trimmed);

    const s = spinner("Verifying access key...");

    try {
      const project = await apiGet<Project>(`${CLI_API_PREFIX}/project`);
      s.succeed("Access key verified!");

      console.log();
      info(`Linked to project: ${bold(project.name)}`);
      info(`Credentials saved to ${dim(getCredentialsFilePath())}`);
      console.log();
    } catch (err) {
      s.fail("Access key verification failed.");
      throw err;
    }
  });
