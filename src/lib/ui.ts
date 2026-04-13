import ora, { type Ora } from "ora";
import chalk from "chalk";
import Table from "cli-table3";

// ── Spinner ──────────────────────────────────────────────────

export function spinner(text: string): Ora {
  return ora({ text, color: "cyan" }).start();
}

// ── Messages ─────────────────────────────────────────────────

export function success(msg: string): void {
  console.log(chalk.green("✔") + " " + msg);
}

export function error(msg: string): void {
  console.error(chalk.red("✖") + " " + msg);
}

export function warn(msg: string): void {
  console.log(chalk.yellow("⚠") + " " + msg);
}

export function info(msg: string): void {
  console.log(chalk.blue("ℹ") + " " + msg);
}

export function dim(msg: string): string {
  return chalk.dim(msg);
}

export function bold(msg: string): string {
  return chalk.bold(msg);
}

export function link(url: string): string {
  return chalk.cyan.underline(url);
}

export function code(text: string): string {
  return chalk.yellow(text);
}

// ── Table ────────────────────────────────────────────────────

export function renderTable(
  headers: string[],
  rows: string[][],
): void {
  const table = new Table({
    head: headers.map((h) => chalk.cyan.bold(h)),
    style: { head: [], border: ["dim"] },
    chars: {
      top: "─",
      "top-mid": "┬",
      "top-left": "┌",
      "top-right": "┐",
      bottom: "─",
      "bottom-mid": "┴",
      "bottom-left": "└",
      "bottom-right": "┘",
      left: "│",
      "left-mid": "├",
      mid: "─",
      "mid-mid": "┼",
      right: "│",
      "right-mid": "┤",
      middle: "│",
    },
  });

  for (const row of rows) {
    table.push(row);
  }

  console.log(table.toString());
}

// ── JSON output ──────────────────────────────────────────────

export function jsonOutput(data: unknown): void {
  console.log(JSON.stringify(data, null, 2));
}

// ── Helpers ──────────────────────────────────────────────────

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return dim("never");
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatStatus(
  revokedAt: string | null,
  expiresAt: string | null,
): string {
  if (revokedAt) return chalk.red("revoked");
  if (expiresAt && new Date(expiresAt) < new Date())
    return chalk.yellow("expired");
  return chalk.green("active");
}

export function formatAppStatus(status: string | undefined): string {
  switch (status) {
    case "running":
      return chalk.green(status);
    case "stopped":
      return chalk.yellow(status);
    case "building":
    case "deploying":
      return chalk.cyan(status);
    case "error":
      return chalk.red(status);
    case "idle":
      return chalk.dim(status);
    case "not_deployed":
      return chalk.dim("not deployed");
    default:
      return chalk.dim(status || "unknown");
  }
}

export function formatDeploymentStatus(status: string): string {
  switch (status) {
    case "ready":
      return chalk.green(status);
    case "queued":
      return chalk.dim(status);
    case "building":
    case "deploying":
      return chalk.cyan(status);
    case "error":
      return chalk.red(status);
    case "canceled":
      return chalk.yellow(status);
    default:
      return chalk.dim(status);
  }
}

export function formatDbType(type: string): string {
  const colors: Record<string, (s: string) => string> = {
    postgres: chalk.blue,
    mysql: chalk.yellow,
    mariadb: chalk.magenta,
    mongo: chalk.green,
    redis: chalk.red,
  };
  const colorFn = colors[type] || chalk.dim;
  return colorFn(type);
}
