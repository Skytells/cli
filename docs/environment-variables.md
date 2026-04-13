# Environment Variables

Environment variables allow you to configure your apps and projects without hardcoding values. This guide covers listing and setting environment variables at both the project and app level.

## Prerequisites

- Authenticated with `skytells login`
- A project access key linked with `skytells link <key>`

## List Environment Variables

```bash
skytells env ls
```

Lists all environment variables for the linked project.

| Option | Description |
|--------|-------------|
| `--app <id>` | List variables for a specific app instead of the project |
| `--json` | Output as JSON |

**Examples:**

```bash
# List project-level variables
skytells env ls

# List variables for a specific app
skytells env ls --app abc123

# JSON output
skytells env ls --json
```

**Example output:**

```
┌──────────────────┬───────────────────────────┐
│ Key              │ Value                     │
├──────────────────┼───────────────────────────┤
│ NODE_ENV         │ production                │
│ PORT             │ 3000                      │
│ DATABASE_URL     │ postgres://...            │
└──────────────────┴───────────────────────────┘
```

## Set Environment Variables

```bash
skytells env set <pairs...>
```

Sets one or more environment variables. Variables are specified in `KEY=value` format.

| Argument | Description |
|----------|-------------|
| `pairs` | One or more `KEY=value` pairs |

| Option | Description |
|--------|-------------|
| `--app <id>` | Set variables for a specific app instead of the project |
| `--json` | Output as JSON |

**Examples:**

```bash
# Set a single variable
skytells env set NODE_ENV=production

# Set multiple variables at once
skytells env set API_KEY=abc123 NODE_ENV=production PORT=3000

# Set variables for a specific app
skytells env set --app abc123 DATABASE_URL=postgres://user:pass@host:5432/db

# Set a variable with spaces in the value (use quotes)
skytells env set APP_NAME="My Application"
```

## Project vs. App Variables

Environment variables can be set at two levels:

- **Project-level**: Available to all apps in the project. Set without the `--app` flag.
- **App-level**: Scoped to a specific app. Set with `--app <id>`.

App-level variables take precedence over project-level variables when both exist with the same key.

## Common Patterns

### Configure a New App

```bash
# Set all required variables for an app
skytells env set --app <app-id> \
  NODE_ENV=production \
  PORT=3000 \
  DATABASE_URL=postgres://... \
  REDIS_URL=redis://... \
  API_KEY=your-api-key
```

### Update a Configuration Value

```bash
# Change a single variable
skytells env set --app <app-id> API_KEY=new-api-key

# Redeploy to apply the change
skytells apps redeploy <app-id>
```

### CI/CD Integration

Use JSON output for scripting:

```bash
# Get current variables as JSON
skytells env ls --app <app-id> --json

# Set variables in a CI pipeline
skytells env set --app <app-id> \
  COMMIT_SHA=$CI_COMMIT_SHA \
  BUILD_NUMBER=$CI_BUILD_NUMBER
```

## Best Practices

1. **Never commit secrets** — Use environment variables for API keys, database passwords, and other sensitive values
2. **Use project-level variables for shared config** — Database URLs and common settings that apply to multiple apps
3. **Use app-level variables for app-specific config** — Port numbers, feature flags, and per-app settings
4. **Redeploy after changes** — Environment variable changes require a redeployment to take effect
