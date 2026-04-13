# Getting Started

This guide walks you through installing the Skytells CLI, authenticating, and running your first commands.

## Prerequisites

- **Node.js** version 18.0.0 or later
- A Skytells account — [Sign up here](https://console.skytells.ai/login)

Check your Node.js version:

```bash
node --version
```

## Installation

Install the Skytells CLI globally from npm:

```bash
npm install -g @skytells/cli
```

Verify the installation by checking the version:

```bash
skytells --version
# Output: 1.0.0
```

View all available commands:

```bash
skytells --help
```

## Step 1: Authenticate

Sign in to your Skytells account:

```bash
skytells login
```

This will:

1. Start a secure device authorization flow
2. Display a one-time code in your terminal
3. Open your browser to complete authentication

Once approved, the CLI stores your credentials locally at `~/.config/skytells/credentials.json`.

### Alternative: Token-Based Login

If you prefer to use a personal access token:

```bash
skytells login --token
```

You will be prompted to paste a token. Create one at [console.skytells.ai/settings/tokens](https://console.skytells.ai/settings/tokens).

### Verify Authentication

```bash
skytells whoami
```

This displays your authenticated user information.

## Step 2: Link a Project

Most CLI commands operate within the context of a project. Link a project using its access key:

```bash
skytells link sk_proj_your_access_key_here
```

Access keys are available in your project settings at [console.skytells.ai](https://console.skytells.ai).

### View Your Project

```bash
skytells project
```

This shows the project name, ID, type, and other details.

## Step 3: Explore Your Resources

### List Apps

```bash
skytells apps ls
```

### Check Status

```bash
skytells status
```

### Trigger a Deployment

```bash
skytells deploy <app-id>
```

### Stream Logs

```bash
skytells logs <app-id> --follow
```

## Step 4: Use JSON Output

Every command supports `--json` for machine-readable output. This is useful for scripting and CI/CD pipelines:

```bash
skytells apps ls --json
skytells project --json
skytells status --json
```

## What's Next?

- [Authentication](authentication.md) — Learn about scopes, tokens, and access keys in detail
- [Projects](projects.md) — Create and manage projects
- [Apps](apps.md) — Deploy and manage applications
- [Deployments](deployments.md) — Understand the deployment workflow
- [Logs & Status](logs-and-status.md) — Monitor your applications in real time
