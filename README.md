# jyml

Zero-config YAML ↔ JSON converter. One command, no flags needed.

```bash
npx jyml config.yaml   # → config.json
npx jyml data.json      # → data.yaml
```

## Why jyml

- **Zero friction** — pass a file, get the converted file. No flags required.
- **Predictable** — same filename, swapped extension, same directory.
- **LLM-ready** — `--json` structured output, documented exit codes, errors to stderr.
- **Tiny** — two dependencies, < 4 kB published.

## Install

```bash
# Global install
npm install -g jyml

# Or run directly
npx jyml config.yaml
```

## Usage

```bash
jyml <file> [options]
```

### Arguments

| Argument | Description |
|----------|-------------|
| `file`   | Path to the input file (.yaml, .yml, or .json) |

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `-o, --output <path>` | Output file path | Input file with swapped extension |
| `--json` | Print structured JSON to stdout (no file written) | — |
| `--indent <n>` | Indentation spaces | `2` |
| `-h, --help` | Show help | — |
| `-V, --version` | Show version | — |

## Examples

```bash
# Convert an OpenAPI spec to JSON for code generators
jyml openapi.yaml
# → writes openapi.json

# Convert ESLint config from JSON to YAML
jyml .eslintrc.json
# → writes .eslintrc.yaml

# Grab a value from a GitHub Actions workflow in a script
jyml .github/workflows/ci.yml --json | jq '.content.jobs'

# Convert docker-compose for a tool that needs JSON
jyml docker-compose.yml -o docker-compose.json

# Convert a JSON API response to readable YAML with wider indent
jyml response.json --indent 4
```

## I/O contract

| Stream | Content |
|--------|---------|
| stdout | Converted file content (only with `--json`) |
| stderr | Progress messages, errors, diagnostics |
| file   | Converted output (default mode) |

### `--json` output schema

```json
{
  "input": "/absolute/path/to/input.yaml",
  "format": "json",
  "output": "/absolute/path/to/input.json",
  "content": { ... }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `input` | `string` | Absolute path to the source file |
| `format` | `string` | Output format: `"json"` or `"yaml"` |
| `output` | `string` | Path where the file would be written |
| `content` | `object` | The parsed and converted data |

## Exit codes

| Code | Meaning |
|------|---------|
| `0`  | Success |
| `1`  | Conversion error (invalid YAML/JSON, I/O failure) |
| `2`  | Invalid usage (missing file, bad arguments, unsupported extension) |

## Error format

Errors are printed to stderr with actionable context:

```
Error: File not found: config.yaml
Error: Unsupported file extension ".txt". Supported: .yaml, .yml, .json
Error: Invalid YAML: bad indentation of a mapping entry (1:11)
Error: Invalid JSON: Expected property name or '}' in JSON at position 2
```

## License

MIT
