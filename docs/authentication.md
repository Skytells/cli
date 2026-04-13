# Authentication

The Skytells CLI provides multiple ways to authenticate. This guide covers each method, token scopes, and best practices for securing your credentials.

## Authentication Methods

### 1. Device Flow (Recommended)

The device flow is the most secure and convenient way to authenticate. It uses the OAuth 2.0 Device Authorization Grant (RFC 8628).

```bash
skytells login
```

**How it works:**

1. The CLI requests a device code from the Skytells API
2. A one-time code and a URL are displayed in your terminal
3. Your browser opens the authorization page automatically
4. Enter the code and approve access
5. The CLI receives your token and stores it securely

**Example output:**

```
⠋ Initiating device authorization...

  Your device code is: ABCD-1234

  Open this URL in your browser to authorize:
  https://console.skytells.ai/device

  Waiting for authorization...
✔ Authenticated successfully!
  Credentials saved to ~/.config/skytells/credentials.json
```

The authorization window is valid for 15 minutes. If it expires, simply run `skytells login` again.

#### Custom Scopes

Request specific permissions when logging in:

```bash
skytells login --scopes inference,projects.read,deployments.write
```

### 2. Personal Access Token

Use a pre-generated token for non-interactive environments or quick setup:

```bash
skytells login --token
```

You will be prompted to paste your token. Tokens follow the format `sk_pat_<64 hex characters>` (71 characters total).

**Create a token:**

1. Visit [console.skytells.ai/settings/tokens](https://console.skytells.ai/settings/tokens)
2. Click "Create Token"
3. Select the scopes you need
4. Copy the generated token (it will only be shown once)

### 3. Environment Variables

For CI/CD pipelines and automated environments, set credentials via environment variables:

```bash
# User authentication
export SKYTELLS_TOKEN=sk_pat_your_token_here

# Project-scoped authentication
export SKYTELLS_ACCESS_KEY=sk_proj_your_key_here
```

Environment variables take precedence over stored credentials.

## Access Keys (Project-Scoped)

Access keys scope CLI operations to a specific project. They use the format `sk_proj_*`.

### Link an Access Key

```bash
skytells link sk_proj_your_access_key
```

This stores the access key alongside your user token. Commands that operate on a project (apps, databases, deployments, etc.) will use this key.

### Where to Find Access Keys

Access keys are available in your project settings:

1. Go to [console.skytells.ai](https://console.skytells.ai)
2. Select your project
3. Navigate to **Settings**
4. Copy the access key

## Token Scopes

Scopes control what the CLI can access with your token. Use the minimum scopes needed for your workflow.

| Scope | Description |
|-------|-------------|
| `inference` | Run inference requests |
| `projects.read` | Read project information |
| `projects.write` | Create and modify projects |
| `deployments.read` | View deployments and logs |
| `deployments.write` | Trigger and manage deployments |
| `keys.read` | View API keys |
| `keys.write` | Create and manage API keys |
| `account.read` | Read account information |

**Default scopes** (when no `--scopes` flag is provided):

- `inference`
- `projects.read`
- `deployments.read`
- `account.read`

## Managing Credentials

### View Current User

```bash
skytells whoami
```

Output includes your user ID, name, and authentication status. Use `--json` for machine-readable output.

### Log Out

```bash
skytells logout
```

This removes your stored credentials. Use `--force` to skip the confirmation prompt:

```bash
skytells logout --force
```

### Credential Storage

Credentials are stored at:

```
~/.config/skytells/credentials.json
```

The file is created with `0600` permissions (owner read/write only). It contains:

- Your personal access token (if authenticated)
- Your project access key (if linked)
- Timestamp of when credentials were saved

Override the storage location:

```bash
export SKYTELLS_CONFIG_DIR=/custom/path
```

## Security Best Practices

1. **Use device flow for interactive sessions** — It avoids exposing tokens in shell history
2. **Use environment variables in CI/CD** — Never store credentials in code or config files committed to version control
3. **Request minimal scopes** — Only request the permissions your workflow needs
4. **Rotate tokens regularly** — Generate new tokens periodically and revoke old ones
5. **Keep the CLI updated** — `npm update -g @skytells/cli`

## Troubleshooting

### "You are not authenticated"

Run `skytells login` to authenticate, or set the `SKYTELLS_TOKEN` environment variable.

### "Access key required"

Link a project access key with `skytells link <key>`, or set the `SKYTELLS_ACCESS_KEY` environment variable.

### "Token is invalid or expired"

Generate a new token at [console.skytells.ai/settings/tokens](https://console.skytells.ai/settings/tokens) and re-authenticate.

### "Insufficient scope"

Your token does not have the required permissions. Log in again with the needed scopes:

```bash
skytells login --scopes inference,projects.read,projects.write,deployments.read,deployments.write
```
