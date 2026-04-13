# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.0.x   | Yes       |

## Reporting a Vulnerability

The Skytells team takes security seriously. If you discover a security vulnerability in the Skytells CLI, we appreciate your responsible disclosure.

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, report vulnerabilities by emailing **security@skytells.ai**.

Please include the following details:

- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact
- Suggested fix (if any)

### What to Expect

- **Acknowledgment**: We will acknowledge receipt of your report within 48 hours.
- **Assessment**: We will investigate and assess the vulnerability within 5 business days.
- **Resolution**: We aim to release a fix for confirmed vulnerabilities within 30 days.
- **Disclosure**: We will coordinate with you on the timing of public disclosure.

### Scope

The following are in scope for security reports:

- Authentication and credential handling
- Token storage and access controls
- Network communication security
- Command injection or argument handling vulnerabilities
- Dependency vulnerabilities

### Security Best Practices

When using the Skytells CLI:

1. **Protect your credentials**: The CLI stores tokens at `~/.config/skytells/credentials.json` with restrictive file permissions (`0600`). Do not share this file or commit it to version control.

2. **Use environment variables in CI/CD**: In automated environments, use `SKYTELLS_TOKEN` or `SKYTELLS_ACCESS_KEY` environment variables instead of storing credentials on disk.

3. **Rotate tokens regularly**: Generate new personal access tokens periodically at [console.skytells.ai/settings/tokens](https://console.skytells.ai/settings/tokens).

4. **Use minimal scopes**: When generating tokens, request only the scopes your workflow requires.

5. **Keep the CLI updated**: Always use the latest version to benefit from security patches.

   ```bash
   npm update -g @skytells/cli
   ```

6. **Verify the package**: The CLI is published as `@skytells/cli` on npm. Always install from the official npm registry.

## Dependencies

We regularly audit and update dependencies to address known vulnerabilities. The CLI uses a minimal set of well-maintained dependencies.
