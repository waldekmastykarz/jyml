# Copilot Instructions — jyml

## Project Overview

jyml is a zero-config CLI tool that converts YAML ↔ JSON. It's published to npm as a single binary (`jyml`). The entire codebase is intentionally tiny (~4 kB published) with two runtime dependencies: `commander` (CLI framework) and `js-yaml` (YAML parser/serializer).

## Architecture

```
bin/jyml.js    → CLI entry point (commander setup, arg parsing, error handling)
lib/convert.js → Core conversion logic (detect format, read, convert, write)
```

- Format detection is extension-based (`.yaml`/`.yml`/`.json`), not content-based.
- `ConvertError` carries an `exitCode` property: `1` = conversion error, `2` = invalid usage. The CLI reads `err.exitCode` to set the process exit code.
- All user-facing messages go to stderr (`console.error`). stdout is reserved for `--json` structured output only.

## Development

- **Node ≥ 20** required (`"engines"` in package.json).
- **CommonJS** module system (`"type": "commonjs"`).
- **Zero dev dependencies** — tests use Node's built-in `node:test` and `node:assert/strict`.
- Run tests: `npm test` (runs `node --test 'test/**/*.test.js'`).
- No build step, no bundler, no transpiler.

## Testing Conventions

Tests in [test/convert.test.js](test/convert.test.js) are **CLI integration tests** — they spawn the actual binary via `execFileSync` and assert on stdout, stderr, and exit codes. There are no unit tests for `lib/convert.js` functions directly.

Key patterns:
- The `run()` helper wraps `execFileSync` and returns `{ stdout, stderr, exitCode }`.
- Generated files are tracked via `scheduleCleanup()` and removed in `afterEach`.
- Test fixtures live in `test/fixtures/` — includes valid/invalid samples for both formats.

## Release Workflow

- Version bumps use the `bump-version` skill (see `.github/skills/bump-version/SKILL.md`).
- `npm version <patch|minor|major>` creates a `v*` tag → triggers the `publish.yml` workflow → publishes to npm.
- `prepublishOnly` runs tests before every publish.
- Changelog follows [Keep a Changelog](https://keepachangelog.com/) format in `CHANGELOG.md`.

## Conventions

- **Exit codes matter.** `0` = success, `1` = conversion error, `2` = invalid usage. Any new error paths must use the correct code via `ConvertError`.
- **Errors are actionable.** Error messages include context (the file path, the bad extension, the parse error). Follow the pattern: `Error: <what went wrong>: <specific detail>`.
- **No unnecessary abstraction.** The project is intentionally simple — one library file, one CLI file. Don't introduce helpers, utilities, or layers unless there's a concrete need.
- Dependabot runs daily for both npm and GitHub Actions dependencies.
