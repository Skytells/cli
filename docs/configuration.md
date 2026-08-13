# Configuration

This guide covers all configuration options for the Skytells CLI, including environment variables, credential storage, and customization.

## Environment Variables

The following environment variables can be used to configure the CLI behavior:

| Variable | Description | Default |
|----------|-------------|---------|
| `SKYTELLS_TOKEN` | Personal access token for authentication | — |
| `SKYTELLS_ACCESS_KEY` | Project-scoped access key | — |
| `SKYTELLS_API_KEY` | API key for Models and Predictions | — |
| `SKYTELLS_API_URL` | Override the API base URL | `https://console.skytells.ai` |
| `SKYTELLS_AI_API_URL` | Override the Models and Predictions API base URL | `https://api.skytells.ai/v1` |
| `SKYTELLS_CONFIG_DIR` | Custom path for configuration files | `~/.config/skytells` |

Environment variables take precedence over stored credentials.

### Usage in CI/CD

Set these variables in your CI/CD pipeline to avoid interactive authentication:

```bash
# GitHub Actions example
env:
  SKYTELLS_TOKEN: ${{ secrets.SKYTELLS_TOKEN }}
  SKYTELLS_ACCESS_KEY: ${{ secrets.SKYTELLS_ACCESS_KEY }}
  SKYTELLS_API_KEY: ${{ secrets.SKYTELLS_API_KEY }}
```

```bash
# Shell example
export SKYTELLS_TOKEN=sk_pat_your_token_here
export SKYTELLS_ACCESS_KEY=sk_proj_your_key_here
export SKYTELLS_API_KEY=your_skytells_api_key

skytells deploy my-app
```

## Credential Storage

### Location

By default, credentials are stored at:

```
~/.config/skytells/credentials.json
```

Override the directory with:

```bash
export SKYTELLS_CONFIG_DIR=/custom/path
```

### File Permissions

The credentials file is created with `0600` permissions (owner read/write only). Do not change these permissions.

### File Structure

The credentials file contains:

```json
{
  "token": "sk_pat_...",
  "access_key": "sk_proj_...",
  "api_key": "...",
  "created_at": 1776076200000
}
```

### Security

- **Never commit this file** to version control
- The file is automatically excluded by most `.gitignore` templates
- In CI/CD environments, use environment variables instead of file-based credentials
- Rotate tokens regularly at [console.skytells.ai/settings/tokens](https://console.skytells.ai/settings/tokens)
- Rotate Skytells API keys at [console.skytells.ai/settings/api-keys](https://console.skytells.ai/settings/api-keys)

## JSON Output

All commands support the `--json` flag for machine-readable output. This is useful for:

- CI/CD pipeline integration
- Shell scripting
- Programmatic processing with tools like `jq`

```bash
# Get project info as JSON
skytells project --json

# Parse with jq
skytells apps ls --json | jq '.[].name'

# Use in scripts
APP_STATUS=$(skytells status --json | jq -r '.apps[0].status')
```

## Precedence Order

When multiple configuration sources are available, the CLI uses this precedence order (highest to lowest):

1. **Command-line flags** — `--token`, `--scopes`, etc.
2. **Environment variables** — `SKYTELLS_TOKEN`, `SKYTELLS_ACCESS_KEY`, `SKYTELLS_API_KEY`
3. **Stored credentials** — `~/.config/skytells/credentials.json`
