# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.1.0] - 2026-02-20

### Added

- YAML to JSON conversion (`.yaml`, `.yml` → `.json`)
- JSON to YAML conversion (`.json` → `.yaml`)
- Auto-detect format from file extension
- Default output path with swapped extension
- Custom output path via `-o, --output <path>`
- Structured JSON output to stdout via `--json`
- Configurable indentation via `--indent <n>`
- Documented exit codes: `0` (success), `1` (conversion error), `2` (invalid usage)
- Actionable error messages to stderr
