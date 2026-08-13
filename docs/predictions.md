# Models and Predictions

The Predictions API runs image, video, and audio models. The Models API lists the models available to your account and exposes the input schema required by each model.

These APIs use a Skytells API key, which is separate from the personal access token used by `skytells login` and the project access key used by `skytells link`.

## Configure an API Key

Create a key at [console.skytells.ai/settings/api-keys](https://console.skytells.ai/settings/api-keys), then run:

```bash
skytells api-key set
```

The key prompt is masked. The CLI validates the key against the Models API before storing it in `~/.config/skytells/credentials.json` with `0600` permissions.

```bash
# Show whether a key is configured
skytells api-key status

# Replace the key
skytells api-key update

# Remove the stored key
skytells api-key rm
```

If you skip this step, the first Models or Predictions command prompts for the key automatically. In CI, use `SKYTELLS_API_KEY` to avoid an interactive prompt.

## Discover Models

List every model available to the active API key:

```bash
skytells models ls
skytells models ls --type image
skytells models ls --type video --json
```

The `namespace` column is the model identifier used by `predictions create`.

Inspect model details:

```bash
skytells models inspect truefusion
```

Include the model-specific input and output JSON Schemas:

```bash
skytells models inspect truefusion --schemas
skytells models inspect truefusion --schemas --json
```

Use the input schema to identify required fields, accepted enum values, limits, and defaults before creating a prediction.

## Create a Prediction

For models that only require a prompt, use the prompt shortcut:

```bash
skytells predictions create truefusion \
  --prompt "A portrait of an astronaut in a garden"
```

The command returns as soon as the API responds unless `--wait` or `--output` is provided.

### Model-Specific Input

Pass model-specific fields as an inline JSON object:

```bash
skytells predictions create truefusion \
  --input '{"prompt":"A lighthouse at dusk","aspect_ratio":"16:9","number_of_images":2}' \
  --wait
```

For complex inputs, use a JSON file prefixed with `@`:

```json
{
  "prompt": "A cinematic flight through a futuristic city",
  "seconds": 8,
  "aspect_ratio": "16:9"
}
```

```bash
skytells predictions create <video-model> \
  --input @video-input.json \
  --wait
```

Provide exactly one of `--input` or `--prompt`.

### Wait and Download Outputs

Generated output URLs expire five minutes after a prediction completes. Download assets immediately:

```bash
skytells predictions create truefusion \
  --prompt "A botanical illustration of an orchid" \
  --output ./generated
```

`--output` waits for a terminal status and streams every generated file into the target directory. The default timeout is 900 seconds; override it when running longer video models:

```bash
skytells predictions create <video-model> \
  --input @video-input.json \
  --output ./generated \
  --timeout 1800
```

### Webhooks

Register a webhook URL when creating the prediction:

```bash
skytells predictions create truefusion \
  --prompt "A studio product photograph" \
  --webhook https://example.com/webhooks/skytells
```

## Get and List Predictions

Retrieve the latest status and outputs for one prediction:

```bash
skytells predictions get <id>
skytells predictions get <id> --json
```

List recent predictions:

```bash
skytells predictions ls
skytells predictions ls --model truefusion --status succeeded
skytells predictions ls --from 2026-08-01 --to 2026-08-13
skytells predictions ls --page 2 --per-page 50 --json
```

`--per-page` accepts values from 1 to 50. Dates use `YYYY-MM-DD`.

## Cancel a Prediction

Only queued or processing predictions can be canceled:

```bash
skytells predictions cancel <id>
```

Canceled predictions cannot be resumed.

## Delete a Prediction

Permanently delete a prediction and its associated output:

```bash
skytells predictions rm <id>
skytells predictions rm <id> --force --json
```

This action cannot be undone.

## CI Example

```bash
export SKYTELLS_API_KEY="$CI_SKYTELLS_API_KEY"

skytells predictions create truefusion \
  --input @prediction-input.json \
  --output ./artifacts \
  --json > prediction.json
```

Use `SKYTELLS_AI_API_URL` only when targeting a compatible non-production API endpoint. Its default is `https://api.skytells.ai/v1`.