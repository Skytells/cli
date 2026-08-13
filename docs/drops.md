# Drops

Drops deploy static sites directly from ZIP archives. A successful deployment is served from `https://<slug>.drops.skytells.app`.

## Prerequisites

- A Hobby, Pro, or Enterprise project
- The project UUID
- One supported credential:
  - A project access key with both `deploy` and `settings` scopes, or the `admin` scope
  - A personal access token or authenticated user with at least Admin access to the project
- A ZIP archive whose filename ends in `.zip`

Authenticate with a project access key:

```bash
skytells link sk_proj_your_access_key
```

Or authenticate as a user:

```bash
skytells login
```

You can also provide credentials through `SKYTELLS_ACCESS_KEY` or `SKYTELLS_TOKEN`. If both credential types are configured, the CLI uses the project access key.

## Deploy a Drop

```bash
skytells drops deploy <zip> --project <uuid> --slug <slug>
```

```bash
skytells drops deploy ./dist/product-docs.zip \
  --project 550e8400-e29b-41d4-a716-446655440000 \
  --slug product-docs
```

The command streams the archive from disk, waits for Skytells to inspect it, and returns after the deployment is accepted.

## Arguments and Options

| Argument or option | Required | Description |
|--------------------|----------|-------------|
| `zip` | Yes | Path to the ZIP archive |
| `--project <uuid>` | Yes | UUID of the project that owns the Drop |
| `--slug <slug>` | Yes | Globally unique DNS label used for the Drop domain |
| `--build-path <path>` | No | Build path inside the archive; defaults to `/` |
| `--upload-id <uuid>` | No | Correlation UUID; generated automatically when omitted |
| `--name <name>` | No | Display name; defaults to the slug and is limited to 100 characters |
| `--json` | No | Print the accepted deployment as JSON |

Slugs must contain 2-63 lowercase letters, digits, or internal hyphens. Build paths cannot contain a `..` segment.

## Build Path

By default, Skytells serves the archive root. Use `--build-path` when the deployable files are in a subdirectory:

```bash
skytells drops deploy ./site.zip \
  --project 550e8400-e29b-41d4-a716-446655440000 \
  --slug company-site \
  --build-path dist
```

An empty build path also selects the archive root:

```bash
skytells drops deploy ./site.zip \
  --project 550e8400-e29b-41d4-a716-446655440000 \
  --slug company-site \
  --build-path ""
```

## JSON Output

Use `--json` in scripts and CI pipelines:

```bash
skytells drops deploy ./site.zip \
  --project "$SKYTELLS_PROJECT_ID" \
  --slug product-docs \
  --json
```

The response has this shape:

```json
{
  "drop_id": "62cf59ce-66d9-4aca-9137-dde606f356f2",
  "drop_slug": "product-docs",
  "domain_url": "https://product-docs.drops.skytells.app",
  "deployment_id": "dd6e1148-614d-4719-b96e-075a8c60d7d1",
  "status": "building"
}
```

## Plan Limits

| Plan | Drops | Maximum ZIP size |
|------|-------|------------------|
| Free | Disabled | N/A |
| Hobby | Enabled | 12 MB |
| Pro | Enabled | 50 MB |
| Enterprise | Enabled | 100 MB |

Authentication, project access, plan limits, slug availability, archive validation, and security inspection are checked before deployment.

## Errors and Retries

The CLI prints the error returned by Skytells. Common causes include an unavailable slug, a ZIP larger than the project limit, insufficient key scopes, a project mismatch, or a security inspection rejection.

Network failures and temporary server errors can be retried with backoff. Do not retry validation or authorization errors without changing the request.