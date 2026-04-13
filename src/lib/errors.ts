export class CLIError extends Error {
  constructor(
    message: string,
    public readonly exitCode: number = 1,
  ) {
    super(message);
    this.name = "CLIError";
  }
}

export class AuthRequiredError extends CLIError {
  constructor() {
    super("Not authenticated. Run 'skytells login' first.", 1);
    this.name = "AuthRequiredError";
  }
}

export class AccessKeyRequiredError extends CLIError {
  constructor() {
    super(
      "No access key configured. Run 'skytells link <access-key>' or set SKYTELLS_ACCESS_KEY.",
      1,
    );
    this.name = "AccessKeyRequiredError";
  }
}

export class TokenExpiredError extends CLIError {
  constructor() {
    super(
      "Your token has expired. Run 'skytells login' to authenticate again.",
      1,
    );
    this.name = "TokenExpiredError";
  }
}

export class InsufficientScopeError extends CLIError {
  constructor(description?: string) {
    const msg = description
      ? `Insufficient permissions. ${description}`
      : "Insufficient permissions. Ensure your access key has the required scopes.";
    super(msg, 1);
    this.name = "InsufficientScopeError";
  }
}

export function handleApiError(
  status: number,
  body: Record<string, unknown>,
): never {
  const errorMsg =
    (body.error as string) || `Request failed (${status}).`;
  const limitType = body.limit_type as string | undefined;

  switch (status) {
    case 401:
      throw new AuthRequiredError();
    case 403:
      if (limitType) {
        throw new CLIError(errorMsg);
      }
      throw new InsufficientScopeError(errorMsg);
    case 404:
      throw new CLIError(errorMsg || "Resource not found.");
    case 409:
      throw new CLIError(errorMsg || "Conflict — resource already exists.");
    case 502:
      throw new CLIError(errorMsg || "Upstream infrastructure error.");
    case 503:
      throw new CLIError(errorMsg || "Service temporarily unavailable.");
    default:
      throw new CLIError(errorMsg);
  }
}
