'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const YAML_EXTS = new Set(['.yaml', '.yml']);
const JSON_EXTS = new Set(['.json']);

class ConvertError extends Error {
  constructor(message, exitCode = 1) {
    super(message);
    this.exitCode = exitCode;
  }
}

function detectFormat(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (YAML_EXTS.has(ext)) return 'yaml';
  if (JSON_EXTS.has(ext)) return 'json';
  return null;
}

function defaultOutputPath(inputPath, inputFormat) {
  const dir = path.dirname(inputPath);
  const base = path.basename(inputPath, path.extname(inputPath));
  const newExt = inputFormat === 'yaml' ? '.json' : '.yaml';
  return path.join(dir, base + newExt);
}

function convert(inputPath, options = {}) {
  const resolved = path.resolve(inputPath);

  if (!fs.existsSync(resolved)) {
    throw new ConvertError(`File not found: ${inputPath}`, 2);
  }

  const format = detectFormat(resolved);
  if (!format) {
    const ext = path.extname(resolved);
    throw new ConvertError(
      `Unsupported file extension "${ext}". Supported: .yaml, .yml, .json`,
      2
    );
  }

  const raw = fs.readFileSync(resolved, 'utf-8');
  let data;
  let output;

  if (format === 'yaml') {
    try {
      data = yaml.load(raw);
    } catch (e) {
      throw new ConvertError(`Invalid YAML: ${e.message}`);
    }
    output = JSON.stringify(data, null, options.indent ?? 2) + '\n';
  } else {
    try {
      data = JSON.parse(raw);
    } catch (e) {
      throw new ConvertError(`Invalid JSON: ${e.message}`);
    }
    output = yaml.dump(data, { indent: options.indent ?? 2, lineWidth: -1 });
  }

  if (options.json) {
    const result = {
      input: resolved,
      format: format === 'yaml' ? 'json' : 'yaml',
      output: options.output || defaultOutputPath(resolved, format),
      content: data
    };
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    return;
  }

  const outputPath = options.output
    ? path.resolve(options.output)
    : defaultOutputPath(resolved, format);

  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, output, 'utf-8');
  console.error(`Converted ${path.basename(resolved)} → ${path.relative(process.cwd(), outputPath)}`);
}

module.exports = { convert, detectFormat, defaultOutputPath, ConvertError };
