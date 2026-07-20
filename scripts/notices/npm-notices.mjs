#!/usr/bin/env node
// Format the JSON output of license-checker-rseidelsohn into an attribution
// section: name, version, licence id and the FULL licence text of every npm
// package bundled into the shipped web app.
//
// Usage:  npx license-checker-rseidelsohn --production --json --excludePrivatePackages --start web \
//           | node scripts/notices/npm-notices.mjs
//
// The package list comes from the real installed dependency tree — it is never
// hand-maintained. Fails loudly if a package has no readable licence file, so a
// missing attribution can never be silently shipped.
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';

const raw = readFileSync(0, 'utf8');
const pkgs = JSON.parse(raw);

const LICENCE_FILE = /^(licen[cs]e|copying|notice)/i;
const out = [];
const problems = [];

for (const key of Object.keys(pkgs).sort()) {
  const info = pkgs[key];
  const at = key.lastIndexOf('@');
  const name = key.slice(0, at);
  const version = key.slice(at + 1);
  const licence = Array.isArray(info.licenses) ? info.licenses.join(' OR ') : info.licenses;
  const file = info.licenseFile;

  if (!file || !LICENCE_FILE.test(basename(file))) {
    problems.push(`${key}: no licence file found (licenseFile=${file || 'none'})`);
    continue;
  }
  let text;
  try {
    text = readFileSync(file, 'utf8').trimEnd();
  } catch (err) {
    problems.push(`${key}: cannot read ${file}: ${err.message}`);
    continue;
  }

  out.push(
    '-'.repeat(80),
    `Package : ${name}`,
    `Version : ${version}`,
    `Licence : ${licence}`,
    '-'.repeat(80),
    '',
    text,
    '',
  );
}

if (problems.length) {
  console.error('npm-notices: cannot attribute the following packages:');
  for (const p of problems) console.error('  - ' + p);
  process.exit(1);
}

process.stdout.write(out.join('\n') + '\n');
