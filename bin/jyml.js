#!/usr/bin/env node

'use strict';

const { program } = require('commander');
const { convert } = require('../lib/convert');
const { version } = require('../package.json');

program
  .name('jyml')
  .version(version)
  .description('Convert YAML to JSON and JSON to YAML')
  .argument('<file>', 'Path to the input file (YAML or JSON)')
  .option('-o, --output <path>', 'Output file path (default: input file with swapped extension)')
  .option('--json', 'Output result as JSON to stdout instead of writing a file')
  .option('--indent <number>', 'Indentation spaces for output (default: 2)', (v) => {
    const n = parseInt(v, 10);
    if (isNaN(n) || n < 0) {
      console.error(`Error: Invalid indent "${v}". Must be a non-negative integer.`);
      process.exit(2);
    }
    return n;
  }, 2)
  .addHelpText('after', `
Examples:
  jyml openapi.yaml                      Convert OpenAPI spec to JSON → openapi.json
  jyml .eslintrc.json                    Convert ESLint config to YAML → .eslintrc.yaml
  jyml ci.yml --json | jq '.content'    Pipe structured output to jq
  jyml docker-compose.yml -o out.json   Convert to JSON at custom path
  jyml response.json --indent 4         Convert with 4-space indentation

Supported extensions:
  YAML input:  .yaml, .yml
  JSON input:  .json

Output defaults:
  .yaml/.yml → .json     .json → .yaml

Exit codes:
  0  Success
  1  Conversion error (invalid YAML/JSON, I/O failure)
  2  Invalid usage (missing file, bad arguments, unsupported extension)

Notes:
  Primary output to stdout (with --json) or to file (default).
  Errors and diagnostics to stderr.
  Detects format from file extension, not content.`)
  .action((file, options) => {
    try {
      convert(file, options);
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(err.exitCode || 1);
    }
  });

program.parse();
