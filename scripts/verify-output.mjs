#!/usr/bin/env node
// Dependency-free static verifier for Playing to Win HTML output.
// Usage: node scripts/verify-output.mjs <path-to-html>
// Asserts the statically-checkable acceptance criteria. Exit 0 = pass.
import { readFileSync } from 'node:fs';

const file = process.argv[2];
if (!file) {
  console.error('Usage: node scripts/verify-output.mjs <file.html>');
  process.exit(2);
}
const html = readFileSync(file, 'utf8');
const checks = [];
const ok = (name, cond) => checks.push({ name, pass: !!cond });
const has = (re) => re.test(html);

// Self-contained + clean injection
ok('no unreplaced {{TOKENS}}', !has(/\{\{[A-Z_]+\}\}/));
ok('body marker replaced', !html.includes('<!-- P2W:BODY -->'));
// Self-contained: block remote resource loads (src=, <link href>, css url()).
// Plain <a href="https://..."> anchors (e.g. the footer credit) are allowed.
ok('no external src= asset', !has(/\ssrc\s*=\s*["']https?:\/\//i));
ok('no external <link href>', !has(/<link\b[^>]*\shref\s*=\s*["']https?:\/\//i));
ok('no remote css url()', !has(/url\(\s*["']?https?:\/\//i));
ok('no remote font imports', !has(/@import|fonts\.googleapis|fonts\.gstatic/i));

// All 13 sections present, in document
const sections = ['snapshot','executive-verdict','aspiration','where-to-play','how-to-win',
  'capabilities','management','what-must-be-true','premortem','sharpened','validation-plan',
  'summary','recommendation'];
for (const s of sections) ok(`section: ${s}`, has(new RegExp(`data-section=["']${s}["']`)));

// Cascade: exactly 5 nodes with the right keys
// NB: match the exact class to avoid also matching p2w-node-head / p2w-node-detail
ok('cascade has 5 nodes', (html.match(/class=["']p2w-node["']/g) || []).length === 5);
for (const n of ['aspiration','where-to-play','how-to-win','capabilities','management'])
  ok(`node: ${n}`, has(new RegExp(`data-node=["']${n}["']`)));

// Interactive contract hooks present
ok('assumptions cross-link (data-relates)', has(/class=["']p2w-assumptions["']/) && has(/data-relates=/));
ok('confidence pills', has(/class=["']p2w-conf["']/) && has(/data-level=/));
ok('evidence labels', has(/class=["']p2w-ev["']/) && has(/data-kind=/));
ok('exclusions (where not to play)', has(/class=["']p2w-exclude["']/));
ok('verdict plate', has(/class=["']p2w-verdict-plate["']/) && has(/data-verdict=/));
ok('spotlight toggle', has(/id=["']p2w-spotlight-toggle["']/));

// Accessibility + print + motion
ok('print stylesheet', has(/@media\s+print/));
ok('reduced-motion guard', has(/prefers-reduced-motion/));
ok('lang attribute', has(/<html[^>]*\slang=/i));

let failed = 0;
for (const c of checks) { if (!c.pass) failed++; console.log(`${c.pass ? 'PASS' : 'FAIL'}  ${c.name}`); }
console.log(`\n${checks.length - failed}/${checks.length} checks passed`);
process.exit(failed ? 1 : 0);
