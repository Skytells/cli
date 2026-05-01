import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

type PackageJson = {
  name: string;
  version: string;
};

const moduleDir = dirname(fileURLToPath(import.meta.url));

function loadPackageJson(): PackageJson {
  const packagePaths = [
    resolve(moduleDir, "../package.json"),
    resolve(moduleDir, "../../package.json"),
  ];

  let lastError: unknown;

  for (const packagePath of packagePaths) {
    try {
      return JSON.parse(readFileSync(packagePath, "utf8")) as PackageJson;
    } catch (err) {
      lastError = err;
    }
  }

  try {
    throw lastError;
  } catch {
    throw new Error("Unable to load Skytells CLI package metadata.");
  }
}

const packageJson = loadPackageJson();

export const CLI_PACKAGE_NAME = packageJson.name;
export const CLI_VERSION = packageJson.version;
