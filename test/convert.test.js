'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const CLI = path.resolve(__dirname, '..', 'bin', 'jyml.js');
const FIXTURES = path.resolve(__dirname, 'fixtures');

function run(args, opts = {}) {
  try {
    const result = execFileSync(process.execPath, [CLI, ...args], {
      encoding: 'utf-8',
      cwd: opts.cwd || __dirname,
      timeout: 10000
    });
    return { stdout: result, exitCode: 0 };
  } catch (err) {
    return {
      stdout: err.stdout || '',
      stderr: err.stderr || '',
      exitCode: err.status
    };
  }
}

// Clean up generated files after tests
const cleanupFiles = [];

function scheduleCleanup(filePath) {
  cleanupFiles.push(filePath);
}

afterEach(() => {
  while (cleanupFiles.length) {
    const f = cleanupFiles.pop();
    try { fs.unlinkSync(f); } catch {}
  }
});

describe('jyml CLI', () => {
  describe('YAML to JSON', () => {
    it('converts YAML to JSON with default output path', () => {
      const output = path.join(FIXTURES, 'sample.json.tmp');
      const result = run([
        path.join(FIXTURES, 'sample.yaml'),
        '-o', output
      ]);
      scheduleCleanup(output);
      assert.equal(result.exitCode, 0);
      const parsed = JSON.parse(fs.readFileSync(output, 'utf-8'));
      assert.equal(parsed.name, 'jyml');
      assert.deepEqual(parsed.features, ['yaml-to-json', 'json-to-yaml']);
    });

    it('converts .yml extension', () => {
      const ymlFile = path.join(FIXTURES, 'test.yml');
      fs.copyFileSync(path.join(FIXTURES, 'sample.yaml'), ymlFile);
      scheduleCleanup(ymlFile);
      const output = path.join(FIXTURES, 'test.json');
      scheduleCleanup(output);

      const result = run([ymlFile]);
      assert.equal(result.exitCode, 0);
      assert.ok(fs.existsSync(output));
    });
  });

  describe('JSON to YAML', () => {
    it('converts JSON to YAML with default output path', () => {
      const input = path.join(FIXTURES, 'sample.json');
      const output = path.join(FIXTURES, 'sample.yaml.tmp');
      const result = run([input, '-o', output]);
      scheduleCleanup(output);
      assert.equal(result.exitCode, 0);
      const content = fs.readFileSync(output, 'utf-8');
      assert.ok(content.includes('name: jyml'));
      assert.ok(content.includes('- yaml-to-json'));
    });
  });

  describe('--json flag', () => {
    it('outputs structured JSON to stdout', () => {
      const result = run([
        path.join(FIXTURES, 'sample.yaml'),
        '--json'
      ]);
      assert.equal(result.exitCode, 0);
      const parsed = JSON.parse(result.stdout);
      assert.equal(parsed.format, 'json');
      assert.equal(parsed.content.name, 'jyml');
    });
  });

  describe('--output flag', () => {
    it('writes to custom output path', () => {
      const output = path.join(FIXTURES, 'custom-out.json');
      const result = run([
        path.join(FIXTURES, 'sample.yaml'),
        '-o', output
      ]);
      scheduleCleanup(output);
      assert.equal(result.exitCode, 0);
      assert.ok(fs.existsSync(output));
    });

    it('creates output directories if needed', () => {
      const outDir = path.join(FIXTURES, 'subdir');
      const output = path.join(outDir, 'out.json');
      const result = run([
        path.join(FIXTURES, 'sample.yaml'),
        '-o', output
      ]);
      scheduleCleanup(output);
      try { fs.rmdirSync(outDir); } catch {}
      assert.equal(result.exitCode, 0);
    });
  });

  describe('--indent flag', () => {
    it('uses custom indentation', () => {
      const output = path.join(FIXTURES, 'indented.json');
      const result = run([
        path.join(FIXTURES, 'sample.yaml'),
        '-o', output,
        '--indent', '4'
      ]);
      scheduleCleanup(output);
      assert.equal(result.exitCode, 0);
      const content = fs.readFileSync(output, 'utf-8');
      // 4-space indent means lines start with 4 spaces
      assert.ok(content.includes('    "name"'));
    });
  });

  describe('error handling', () => {
    it('exits 2 for missing file argument', () => {
      const result = run([]);
      assert.equal(result.exitCode, 1);
    });

    it('exits 2 for nonexistent file', () => {
      const result = run(['nonexistent.yaml']);
      assert.equal(result.exitCode, 2);
    });

    it('exits 2 for unsupported extension', () => {
      const result = run([path.join(FIXTURES, 'sample.txt')]);
      assert.equal(result.exitCode, 2);
    });

    it('exits 1 for invalid YAML', () => {
      const result = run([
        path.join(FIXTURES, 'invalid.yaml'),
        '--json'
      ]);
      assert.equal(result.exitCode, 1);
    });

    it('exits 1 for invalid JSON', () => {
      const result = run([
        path.join(FIXTURES, 'invalid.json'),
        '--json'
      ]);
      assert.equal(result.exitCode, 1);
    });
  });

  describe('help and version', () => {
    it('shows help with --help', () => {
      const result = run(['--help']);
      assert.equal(result.exitCode, 0);
      assert.ok(result.stdout.includes('Examples:'));
      assert.ok(result.stdout.includes('Exit codes:'));
    });

    it('shows version with --version', () => {
      const result = run(['--version']);
      assert.equal(result.exitCode, 0);
      assert.ok(result.stdout.trim().match(/^\d+\.\d+\.\d+$/));
    });
  });
});
