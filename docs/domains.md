# Domains

Custom domains allow you to serve your applications on your own domain names. This guide covers adding, listing, and removing custom domains.

## Prerequisites

- Authenticated with `skytells login`
- A project access key linked with `skytells link <key>`
- A domain name you own with DNS access

## List Domains

```bash
skytells domains ls
```

Lists all custom domains configured for the linked project.

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |

**Example output:**

```
┌──────────┬─────────────────────┬──────────┬──────────────────┐
│ ID       │ Domain              │ App      │ Status           │
├──────────┼─────────────────────┼──────────┼──────────────────┤
│ dom-001  │ api.example.com     │ my-api   │ active           │
│ dom-002  │ app.example.com     │ frontend │ pending          │
└──────────┴─────────────────────┴──────────┴──────────────────┘
```

## Add a Domain

```bash
skytells domains add <domain>
```

Adds a custom domain to the project.

| Argument | Description |
|----------|-------------|
| `domain` | The domain name to add (e.g., `api.example.com`) |

| Option | Description |
|--------|-------------|
| `--app <id>` | Associate the domain with a specific app |
| `--json` | Output as JSON |

**Examples:**

```bash
# Add a domain
skytells domains add api.example.com

# Add a domain and associate it with an app
skytells domains add api.example.com --app abc123
```

After adding a domain, configure your DNS records as instructed in the output. Typically, you need to create a CNAME record pointing to your Skytells app endpoint.

## Remove a Domain

```bash
skytells domains rm <id>
```

Removes a custom domain from the project.

| Argument | Description |
|----------|-------------|
| `id` | The domain ID |

| Option | Description |
|--------|-------------|
| `-f, --force` | Skip confirmation prompt |
| `--json` | Output as JSON |

**Examples:**

```bash
# Remove with confirmation
skytells domains rm dom-001

# Remove without confirmation
skytells domains rm dom-001 --force
```

## Setup Workflow

1. **Add the domain to your project:**
   ```bash
   skytells domains add api.example.com --app <app-id>
   ```

2. **Configure DNS** — Add the CNAME or A record as shown in the command output.

3. **Verify the domain is active:**
   ```bash
   skytells domains ls
   ```
   The status should change from `pending` to `active` once DNS propagation completes.
