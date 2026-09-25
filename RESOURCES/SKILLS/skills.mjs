#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

const CATALOG_PATH = join(dirname(fileURLToPath(import.meta.url)), 'catalog.json');
const catalog = JSON.parse(readFileSync(CATALOG_PATH, 'utf8'));

const HELP = `Usage: node skills.mjs <command> [options]

  detect                      Show the detected stack and the skills it maps to.
  install [--stack a,b] [-y]  Install the catalog skills for the detected stack
                              (plus any --stack given) into the current project,
                              pinned to the reviewed commit, and verify their hash.
  verify                      Compare the project's skills-lock.json with the catalog.
  update [name...] [--write]  Look for new upstream commits and show each skill's
                              diff. With --write, save the new pins.

Stacks: base (always), ${Object.keys(catalog.stacks).join(', ')}`;

function fail(message) {
  console.error(`\n✗ ${message}`);
  process.exit(1);
}

function run(cmd, args, options = {}) {
  const result = spawnSync(cmd, args, { encoding: 'utf8', ...options });
  if (result.error) fail(`Could not run ${cmd}: ${result.error.message}`);
  return result;
}

function skillsCli(args, options = {}) {
  return run('npx', ['-y', catalog.cli, ...args], options);
}

function groupBy(list, key) {
  const groups = new Map();
  for (const item of list) {
    const k = key(item);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(item);
  }
  return groups;
}

function readLock(dir) {
  const path = join(dir, 'skills-lock.json');
  return existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : { skills: {} };
}

function readDependencies(dir) {
  const path = join(dir, 'package.json');
  if (!existsSync(path)) return new Set();
  const pkg = JSON.parse(readFileSync(path, 'utf8'));
  return new Set(
    Object.keys({ ...pkg.dependencies, ...pkg.devDependencies, ...pkg.peerDependencies }),
  );
}

function detectStacks(dir) {
  const deps = readDependencies(dir);
  const stacks = new Set(['base']);
  for (const [stack, rule] of Object.entries(catalog.stacks)) {
    const byDeps = rule.deps?.some((d) => deps.has(d));
    const byFiles = rule.files?.some((f) => existsSync(join(dir, f)));
    if (byDeps || byFiles) stacks.add(stack);
  }
  return stacks;
}

function requestedStacks(options) {
  const stacks = detectStacks(process.cwd());
  for (const s of options.stack) {
    if (s !== 'base' && !catalog.stacks[s]) fail(`Unknown stack: ${s}`);
    stacks.add(s);
  }
  return stacks;
}

function printPlan(stacks, skills) {
  console.log(`Stack: ${[...stacks].join(', ')}\n`);
  for (const s of skills) {
    console.log(`  ${s.name.padEnd(34)} ${s.source.padEnd(28)} ${s.trust}`);
  }
}

function problemsAgainstCatalog(dir, expected) {
  const lock = readLock(dir);
  const problems = [];
  for (const [name, entry] of Object.entries(lock.skills)) {
    const s = catalog.skills.find((x) => x.name === name);
    if (!s) {
      problems.push(`${name}: not in the catalog`);
    } else if (entry.source !== s.source || entry.ref !== s.ref) {
      problems.push(
        `${name}: installed from ${entry.source}#${entry.ref ?? '(unpinned)'}, ` +
          `the catalog says ${s.source}#${s.ref}`,
      );
    } else if (entry.computedHash !== s.hash) {
      problems.push(`${name}: contents don't match the reviewed hash`);
    }
  }
  for (const name of expected) {
    if (!lock.skills[name]) problems.push(`${name}: missing from skills-lock.json`);
  }
  return problems;
}

async function confirm(question) {
  if (!process.stdin.isTTY) fail('No interactive terminal: run again with -y to confirm.');
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(`${question} [y/N] `);
  rl.close();
  return /^y/i.test(answer.trim());
}

function detect(options) {
  const stacks = requestedStacks(options);
  printPlan(stacks, catalog.skills.filter((s) => stacks.has(s.stack)));
}

async function install(options) {
  const stacks = requestedStacks(options);
  const skills = catalog.skills.filter((s) => stacks.has(s.stack));
  const unpinned = skills.filter((s) => !s.ref || !s.hash);
  if (unpinned.length) {
    fail(
      `No reviewed commit in the catalog for: ${unpinned.map((s) => s.name).join(', ')}. ` +
        'Run "update --write" from RESOURCES/SKILLS first.',
    );
  }

  printPlan(stacks, skills);
  if (!options.yes && !(await confirm('\nInstall these skills into this project?'))) return;

  for (const group of groupBy(skills, (s) => `${s.source}#${s.ref}`).values()) {
    const { source, ref } = group[0];
    const names = group.map((s) => s.name);
    const result = skillsCli(
      ['add', `${source}#${ref}`, '--skill', ...names, '--agent', ...catalog.agents, '-y'],
      { stdio: 'inherit' },
    );
    if (result.status !== 0) fail(`Installing ${source} failed`);
  }

  const names = skills.map((s) => s.name);
  const problems = problemsAgainstCatalog(process.cwd(), names);
  if (problems.length) {
    const affected = names.filter((n) => problems.some((p) => p.startsWith(`${n}:`)));
    if (affected.length) skillsCli(['remove', ...affected, '-y'], { stdio: 'inherit' });
    fail(`Verification failed; the affected skills were uninstalled:\n  ${problems.join('\n  ')}`);
  }
  console.log('\n✓ Skills installed and verified. Commit .agents/, .claude/ and skills-lock.json.');
}

function verify() {
  const problems = problemsAgainstCatalog(process.cwd(), []);
  if (problems.length) fail(`Some skills don't match what was reviewed:\n  ${problems.join('\n  ')}`);
  console.log('✓ Every skill in the project matches the catalog.');
}

function latestCommit(source) {
  const result = run('git', ['ls-remote', `https://github.com/${source}.git`, 'HEAD']);
  const sha = result.stdout.split('\t')[0];
  if (result.status !== 0 || !/^[0-9a-f]{40}$/.test(sha)) fail(`Could not read HEAD of ${source}`);
  return sha;
}

function showDiff(source, from, to, path, tmp) {
  const repo = join(tmp, 'repo');
  if (!existsSync(repo)) {
    run('git', [
      'clone', '--quiet', '--filter=blob:none', '--no-checkout',
      `https://github.com/${source}.git`, repo,
    ]);
  }
  run('git', ['-C', repo, '--no-pager', 'diff', '--color=always', from, to, '--', path], {
    stdio: 'inherit',
  });
}

function update(names, options) {
  const unknown = names.filter((n) => !catalog.skills.some((s) => s.name === n));
  if (unknown.length) fail(`Not in the catalog: ${unknown.join(', ')}`);
  const targets = names.length
    ? catalog.skills.filter((s) => names.includes(s.name))
    : catalog.skills;

  const changes = [];
  for (const [source, skills] of groupBy(targets, (s) => s.source)) {
    const head = latestCommit(source);
    const pending = skills.filter((s) => s.ref !== head);
    if (!pending.length) {
      console.log(`= ${source}: up to date`);
      continue;
    }

    const tmp = mkdtempSync(join(tmpdir(), 'skills-'));
    try {
      run('git', ['init', '--quiet', tmp]);
      const result = skillsCli(
        ['add', `${source}#${head}`, '--skill', ...pending.map((s) => s.name),
          '--agent', catalog.agents[0], '-y'],
        { cwd: tmp },
      );
      if (result.status !== 0) {
        fail(`Could not download ${source}#${head}:\n${result.stdout}${result.stderr}`);
      }
      const lock = readLock(tmp);

      for (const s of pending) {
        const entry = lock.skills[s.name];
        if (!entry) fail(`${s.name} no longer exists in ${source}`);
        const path = dirname(entry.skillPath);
        const hash = entry.computedHash;

        if (!s.ref) {
          console.log(`\n+ ${s.name}: first pin. Review its full contents:`);
          console.log(`  https://github.com/${source}/tree/${head}/${path}`);
        } else if (hash === s.hash) {
          console.log(`\n~ ${s.name}: the repo moved but this skill didn't change`);
        } else {
          console.log(`\n* ${s.name}: changes in ${source}/${path}`);
          console.log(`  https://github.com/${source}/compare/${s.ref}...${head}`);
          showDiff(source, s.ref, head, path, tmp);
        }
        changes.push({ skill: s, ref: head, hash, path });
      }
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  }

  if (!changes.length) return console.log('\nNothing to update.');
  if (!options.write) {
    return console.log('\nReview the changes above and run again with --write to pin them.');
  }
  for (const { skill, ref, hash, path } of changes) Object.assign(skill, { ref, hash, path });
  writeFileSync(CATALOG_PATH, `${JSON.stringify(catalog, null, 2)}\n`);
  console.log(`\n✓ ${changes.length} pin(s) updated in catalog.json. Commit the change.`);
}

function parseArgs(argv) {
  const options = { stack: [], yes: false, write: false };
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '-y' || arg === '--yes') options.yes = true;
    else if (arg === '--write') options.write = true;
    else if (arg === '--stack') options.stack.push(...(argv[++i] ?? '').split(',').filter(Boolean));
    else if (arg.startsWith('-')) fail(`Unknown option: ${arg}\n\n${HELP}`);
    else positional.push(arg);
  }
  return { command: positional[0], rest: positional.slice(1), options };
}

const { command, rest, options } = parseArgs(process.argv.slice(2));
switch (command) {
  case 'detect': detect(options); break;
  case 'install': await install(options); break;
  case 'verify': verify(); break;
  case 'update': update(rest, options); break;
  default: console.log(HELP);
}
