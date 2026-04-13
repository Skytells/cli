import { Command } from "commander";
import { apiSSE } from "../lib/api.js";
import { CLI_API_PREFIX } from "../lib/constants.js";
import { error, info, dim } from "../lib/ui.js";
import chalk from "chalk";

export const logsCommand = new Command("logs")
  .description("Stream real-time logs for an app")
  .argument("<app>", "App ID or slug")
  .option("--type <type>", "Log type: container (default) or deployment", "container")
  .option("--deployment <id>", "Specific deployment ID (for deployment type)")
  .option("--tail <n>", "Lines to tail (default 100, max 500)", parseInt)
  .option("--follow", "Keep streaming (default for container logs)")
  .option("--json", "Output log events as JSON")
  .action(async (app: string, opts) => {
    const params: Record<string, string | number | undefined> = {
      app_slug: app,
      type: opts.type,
    };
    if (opts.deployment) params.deployment_id = opts.deployment;
    if (opts.tail) params.tail = opts.tail;

    try {
      const stream = apiSSE(`${CLI_API_PREFIX}/logs`, params);

      for await (const event of stream) {
        switch (event.event) {
          case "log": {
            try {
              const payload = JSON.parse(event.data);
              if (opts.json) {
                console.log(JSON.stringify(payload));
              } else {
                console.log(payload.line);
              }
            } catch {
              console.log(event.data);
            }
            break;
          }
          case "status": {
            try {
              const payload = JSON.parse(event.data);
              if (opts.json) {
                console.log(JSON.stringify({ event: "status", ...payload }));
              } else {
                info(`Status: ${chalk.cyan(payload.status)}`);
              }
            } catch {
              info(`Status: ${event.data}`);
            }
            break;
          }
          case "error": {
            try {
              const payload = JSON.parse(event.data);
              if (opts.json) {
                console.log(JSON.stringify({ event: "error", ...payload }));
              } else {
                error(payload.message || event.data);
              }
            } catch {
              error(event.data);
            }
            break;
          }
          case "done": {
            try {
              const payload = JSON.parse(event.data);
              if (opts.json) {
                console.log(JSON.stringify({ event: "done", ...payload }));
              } else {
                info(dim(`Stream ended (${payload.status || "done"})`));
              }
            } catch {
              info(dim("Stream ended"));
            }
            return;
          }
          default: {
            if (opts.json) {
              console.log(JSON.stringify({ event: event.event, data: event.data }));
            }
            break;
          }
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        error(err.message);
      } else {
        error("Failed to stream logs.");
      }
      process.exit(1);
    }
  });
