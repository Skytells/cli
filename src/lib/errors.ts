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

export class ApiKeyRequiredError extends CLIError {
  constructor() {
    super("No Skytells API key configured. Run 'skytells api-key set' or set SKYTELLS_API_KEY.", 1);
    this.name = "ApiKeyRequiredError";
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

export class PaymentRequiredError extends CLIError {
  constructor(description?: string) {
    const msg = description
      ? description
      : "Account suspended or payment outstanding. Visit the Skytells console to resolve.";
    super(msg, 1);
    this.name = "PaymentRequiredError";
  }
}

export class PlanLimitError extends CLIError {
  constructor(description?: string) {
    const msg = description
      ? description
      : "This feature is not available on your current plan. Upgrade to continue.";
    super(msg, 1);
    this.name = "PlanLimitError";
  }
}

export class RateLimitError extends CLIError {
  constructor(description?: string) {
    const msg = description
      ? description
      : "Run limit reached. Upgrade your plan to increase your quota.";
    super(msg, 1);
    this.name = "RateLimitError";
  }
}

export function handleApiError(
  status: number,
  body: Record<string, unknown>,
): never {
  const errorMsg =
    (body.error as string) ||
    (body.message as string) ||
    `Request failed (${status}).`;
  const details = body.details as string | undefined;
  const limitType = body.limit_type as string | undefined;
  const code = body.code as string | undefined;
  const displayMsg = details ? `${errorMsg} ${details}` : errorMsg;

  switch (status) {
    case 400:
      throw new CLIError(displayMsg || "Bad request — check your input.");
    case 401:
      throw new AuthRequiredError();
    case 402:
      throw new PaymentRequiredError(displayMsg);
    case 403:
      if (code === "security_violation") {
        throw new CLIError(displayMsg);
      }
      if (limitType === "plan") {
        throw new PlanLimitError(displayMsg);
      }
      throw new InsufficientScopeError(displayMsg);
    case 404:
      throw new CLIError(displayMsg || "Resource not found.");
    case 409:
      throw new CLIError(displayMsg || "Conflict — resource already exists or limit reached.");
    case 422:
      throw new CLIError(displayMsg || "Validation failed — check your input.");
    case 429:
      throw new RateLimitError(displayMsg);
    case 502:
      throw new CLIError(displayMsg || "Upstream infrastructure error.");
    case 503:
      throw new CLIError(displayMsg || "Service temporarily unavailable.");
    default:
      throw new CLIError(displayMsg);
  }
}
