#!/usr/bin/env node
/**
 * Validates the txAdmin deployment recipe.
 *
 *   1. The recipe declares the keys txAdmin requires.
 *   2. Attribution matches the project standard.
 *   3. Every referenced GitHub repository is published or approved.
 *   4. Every referenced local file exists.
 *   5. No committed file contains a real credential.
 *
 * Check 3 is the important one. The recipe downloads code and runs it on an
 * operator's server, so an unexpected repository reference is a supply-chain
 * problem rather than a typo — and a reference to an unpublished repository
 * fails at deployment while looking complete in review.
 *
 * Known failures are catalogued in docs/conformance.md. They are recorded rather
 * than silently fixed because several are design decisions for the project owner.
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { dirname, resolve, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

let failed = false;
const fail = (m) => { failed = true; console.error(`FAIL  ${m}`); };
const warn = (m) => console.error(`warn  ${m}`);
const pass = (m) => console.log(`ok    ${m}`);

// The recipe filename is not fixed by txAdmin; find whichever yml declares $engine.
const candidates = readdirSync(root).filter((f) => /\.ya?ml$/i.test(f));
const recipeFile = candidates.find((f) =>
  readFileSync(resolve(root, f), 'utf8').includes('$engine'));

if (!recipeFile) {
  fail('no recipe found: no .yml file declares $engine');
  process.exit(1);
}
pass(`recipe found: ${recipeFile}`);
const recipe = readFileSync(resolve(root, recipeFile), 'utf8');

// --- 1. required keys -------------------------------------------------------
for (const key of ['$engine', 'name', 'version', 'author', 'tasks']) {
  const re = new RegExp(`^${key.replace('$', '\\$')}\\s*:`, 'm');
  if (!re.test(recipe)) fail(`recipe is missing a required key: ${key}`);
}
pass('recipe declares the required keys');

// --- 2. attribution ---------------------------------------------------------
const REQUIRED_AUTHOR = 'The Nexus Core Framework team';
const authorMatch = recipe.match(/^author:\s*(.+?)\s*$/m);
if (!authorMatch) {
  fail('recipe declares no author');
} else if (authorMatch[1] !== REQUIRED_AUTHOR) {
  fail(`author is "${authorMatch[1]}", must be "${REQUIRED_AUTHOR}" `
     + '(rendered into the public server hostname) — see docs/conformance.md C-01');
} else {
  pass('author matches the project standard');
}

// --- 3. referenced repositories --------------------------------------------
const PUBLISHED = new Set([
  'NC-Framework/nxc_lib',
  'NC-Framework/nxc_core',
  'NC-Framework/NXC_TXAdmin',
]);
const APPROVED_EXTERNAL = new Set([
  'overextended/oxmysql',
  'citizenfx/cfx-server-data',
  'citizenfx/screenshot-basic',
  'AvarianKnight/pma-voice',
]);

const refs = [...recipe.matchAll(/https:\/\/github\.com\/([\w.-]+\/[\w.-]+)/g)]
  .map((m) => m[1].replace(/\.git$/, ''));

const unique = [...new Set(refs)];
let bad = 0;
for (const ref of unique) {
  if (PUBLISHED.has(ref) || APPROVED_EXTERNAL.has(ref)) continue;
  if (ref.startsWith('NC-Framework/')) {
    fail(`recipe references ${ref}, which this project does not publish `
       + '— see docs/conformance.md C-03');
  } else {
    fail(`recipe references ${ref}, which is not an approved external dependency`);
  }
  bad += 1;
}
if (!bad) pass(`all ${unique.length} referenced repositories are published or approved`);

// A pinned release is correct; an unpinned default branch is a moving target.
const unpinned = [...recipe.matchAll(/ref:\s*(main|master)\s*$/gm)].length;
if (unpinned) {
  warn(`${unpinned} download(s) track a moving branch rather than a pinned release`);
}

// --- 3b. platform ----------------------------------------------------------
// $minFxVersion must not come back.
//
// It read 7290 and made the recipe undeployable on Enhanced: "this recipe
// requires FXServer v7290 or above". The Enhanced server is a separate artifact
// — renamed Cfx Server — that entered early access on 2026-07-21 with its own
// build numbering, below the Legacy series 7290 belongs to. No Enhanced server
// can satisfy a Legacy-era minimum, so the failure is permanent rather than a
// matter of updating.
//
// The official Enhanced reference recipe declares no minimum either. The right
// place for a build floor is a manifest dependency, `/server:NNNN`, which the
// server enforces per resource.
const minFx = recipe.match(/^\$minFxVersion:\s*(\S+)/m);
if (minFx) {
  fail(`recipe declares $minFxVersion ${minFx[1]}. An Enhanced server cannot satisfy a `
     + 'Legacy-era minimum — this is what broke deployment. Use a /server:NNNN manifest '
     + 'dependency instead (ADR-0016, OD-020)');
} else {
  pass('recipe declares no $minFxVersion');
}

// A voice resource wrapping the deprecated client-side Mumble natives
// contradicts server authority: Enhanced's voice API is server-side only.
if (/pma-voice|mumble-voip|salty-?chat/i.test(recipe)) {
  const commentedOut = recipe
    .split(/\r?\n/)
    .filter((l) => /pma-voice|mumble-voip|salty-?chat/i.test(l))
    .every((l) => /^\s*#/.test(l));
  if (!commentedOut) {
    fail('recipe installs a client-authoritative voice resource. Enhanced voice is '
       + 'server-side only; nxc_voice targets it directly (ADR-0017)');
  } else {
    pass('no client-authoritative voice resource is installed');
  }
} else {
  pass('no client-authoritative voice resource is installed');
}

// Nexus Core targets GTA V Enhanced (ADR-0016). A recipe cannot verify which
// artifacts the operator installed, but it can refuse to ship the one thing
// that actively pinned Legacy.
const cfg = resolve(root, 'data', 'server.cfg.template');
if (existsSync(cfg)) {
  const template = readFileSync(cfg, 'utf8');
  const enforced = template.match(/^\s*sv_enforceGameBuild\s+(\d+)/m);
  if (enforced) {
    fail(`server.cfg.template pins sv_enforceGameBuild ${enforced[1]}. `
       + 'Nexus Core targets GTA V Enhanced; a Legacy build must not be enforced (ADR-0016)');
  } else {
    pass('server.cfg.template enforces no game build');
  }
  if (!/^set nxc_server_build ""$/m.test(template)) {
    fail('server.cfg.template must ask the operator to record nxc_server_build, '
       + 'blank (MDD v0.4 38.2)');
  } else {
    pass('server.cfg.template records the deployed server build, blank for the operator');
  }
}

// --- 4. referenced local files ---------------------------------------------
let missing = 0;
for (const m of recipe.matchAll(/^\s*(?:file|src):\s*\.\/(.+)$/gm)) {
  const p = m[1].trim();
  // Paths under ./tmp are produced during the deployment, not stored here.
  if (p.startsWith('tmp/')) continue;
  if (!existsSync(resolve(root, p))) {
    fail(`recipe references a local file that does not exist: ${p}`);
    missing += 1;
  }
}
if (!missing) pass('every referenced local file exists');

// --- 5. committed credentials ----------------------------------------------
const SKIP = new Set(['.git', 'node_modules', 'tmp']);
// An angle-bracket token or a txAdmin substitution token is a placeholder.
const PLACEHOLDER = /<[A-Za-z_]+>|\{\{\w+\}\}/;
const CREDENTIAL = [
  { name: 'connection string with credentials', re: /mysql:\/\/[^\s:'"]+:[^\s@'"]+@/i },
  { name: 'FiveM license key', re: /\bcfxk_[A-Za-z0-9_]{20,}/ },
  { name: 'Discord webhook', re: /discord(?:app)?\.com\/api\/webhooks\/\d+\//i },
  { name: 'private key', re: /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/ },
];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

let findings = 0;
for (const file of walk(root)) {
  if (file.endsWith('check-recipe.mjs')) continue;
  if (/\.(png|jpg|jpeg|gif|ico|zip)$/i.test(file)) continue;
  let text;
  try { text = readFileSync(file, 'utf8'); } catch { continue; }
  text.split(/\r?\n/).forEach((line, i) => {
    if (PLACEHOLDER.test(line)) return;
    for (const rule of CREDENTIAL) {
      if (rule.re.test(line)) {
        fail(`${relative(root, file)}:${i + 1} possible ${rule.name}`);
        findings += 1;
      }
    }
  });
}
if (!findings) pass('no committed credentials');

console.log(failed
  ? '\ncheck-recipe: FAILED — see docs/conformance.md'
  : '\ncheck-recipe: passed');
process.exit(failed ? 1 : 0);
