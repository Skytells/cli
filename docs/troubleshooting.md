# Troubleshooting

Solutions to common issues when using the Skytells CLI.

## Authentication Issues

### "You are not authenticated"

**Cause:** No valid token is stored and no `SKYTELLS_TOKEN` environment variable is set.

**Solution:**

```bash
skytells login
```

Or set the token via environment variable:

```bash
export SKYTELLS_TOKEN=sk_pat_your_token_here
```

### "Access key required"

**Cause:** The command requires a project-scoped access key, but none is linked.

**Solution:**

```bash
skytells link sk_proj_your_access_key
```

Or set via environment variable:

```bash
export SKYTELLS_ACCESS_KEY=sk_proj_your_access_key
```

Access keys are available in your project settings at [console.skytells.ai](https://console.skytells.ai).

### "Token is invalid or expired"

**Cause:** Your stored token has been revoked or has expired.

**Solution:**

1. Generate a new token at [console.skytells.ai/settings/tokens](https://console.skytells.ai/settings/tokens)
2. Log in again:
   ```bash
   skytells login
   ```

### "Insufficient scope"

**Cause:** Your token does not include the permissions required by the command.

**Solution:**

Log in again with the needed scopes:

```bash
skytells login --scopes inference,projects.read,projects.write,deployments.read,deployments.write
```

### Device flow times out

**Cause:** The browser authorization was not completed within 15 minutes.

**Solution:**

Run `skytells login` again and complete the browser authorization promptly.

## Command Issues

### "Command not found: skytells"

**Cause:** The CLI is not installed globally or not in your system PATH.

**Solution:**

```bash
npm install -g @skytells/cli
```

Verify the installation:

```bash
which skytells
skytells --version
```

If using `nvm` or a Node.js version manager, ensure the correct Node.js version is active.

### "Node.js version not supported"

**Cause:** The CLI requires Node.js 18 or later.

**Solution:**

```bash
node --version
```

If the version is below 18, upgrade Node.js:

```bash
# Using nvm
nvm install 18
nvm use 18

# Using Homebrew (macOS)
brew install node@18
```

### Command hangs or no output

**Cause:** Network connectivity issue or the API is temporarily unavailable.

**Solution:**

1. Check your internet connection
2. Verify you can reach the Skytells API:
   ```bash
   curl -s https://console.skytells.ai/api/v1/health
   ```
3. Check [status.skytells.ai](https://status.skytells.ai) for service status
4. If the issue persists, try again in a few minutes

## Network Issues

### Connection refused or timeout

**Cause:** Firewall, proxy, or network configuration blocking the connection.

**Solution:**

1. Ensure `https://console.skytells.ai` is accessible from your network
2. If behind a corporate proxy, configure your HTTP proxy settings:
   ```bash
   export HTTPS_PROXY=http://proxy.example.com:8080
   ```
3. Check if your firewall allows outbound HTTPS (port 443) connections

### SSL certificate errors

**Cause:** System clock is incorrect, or a proxy is intercepting HTTPS traffic.

**Solution:**

1. Verify your system clock is accurate
2. If behind a corporate proxy with TLS inspection, configure the `NODE_EXTRA_CA_CERTS` environment variable with your CA certificate

## Getting Help

If you continue to experience issues:

1. Run the command with `--help` for usage details:
   ```bash
   skytells <command> --help
   ```

2. Check the [online documentation](https://learn.skytells.ai/docs/cli)

3. Visit the [GitHub repository](https://github.com/skytells/cli) to search existing issues or open a new one
