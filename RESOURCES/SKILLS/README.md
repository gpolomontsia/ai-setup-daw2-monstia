# Reviewed skills

Installs [skills.sh](https://skills.sh) skills into each project based on its stack,
but only from a reviewed list and pinned to a specific commit.

## Why `npx skills add` isn't enough

- Unpinned, `npx skills add owner/repo` installs whatever is on `main` that day.
  If the repo changes (or gets compromised), the next install brings something else.
- `skills-lock.json` stores a hash, but `npx skills experimental_install` doesn't
  check it: on a mismatch it installs anyway and silently rewrites the hash.
- A skill runs with the agent's full permissions. It's third-party code.

## How it works

- `catalog.json` is the allowlist: source, the stack that activates each skill,
  trust level and, for each one, the reviewed commit (`ref`) and hash.
  It also pins the CLI version (`skills@1.7.0`).
- `skills.mjs install` detects the stack from `package.json` and a few files,
  installs from `source#ref` and checks that the resulting hash is the reviewed one.
  On a mismatch it uninstalls that skill and fails.
- Before installing, the CLI shows the Gen, Socket and Snyk assessments.

## Using it in a project

```bash
S=~/Projects/ai-setup/skills/skills.mjs

node $S detect                   # which stack it sees and what it would install
node $S install                  # installs base + detected stack (asks for confirmation)
node $S install --stack vue      # for an empty project: force stacks before there are deps
node $S verify                   # useful in CI: fails if any skill is outside the catalog
```

Commit `.agents/skills/`, `.claude/skills/` and `skills-lock.json` in the project,
so any change to a skill shows up in a diff.

Flow for a new project: `install` (installs `grill-me`, `grilling` and, for web
projects, the design skills) → `/grill-me` to settle the plan → scaffold the project →
`install` again to add the stack skills.

## Adding or updating catalog skills

```bash
node skills.mjs update                 # looks for new commits and shows each skill's diff
node skills.mjs update vite --write    # pins the new commit after reviewing the diff
```

To add a skill: find it on skills.sh (prefer official organizations and more than
1,000 installs), add the entry to `catalog.json` without `ref` or `hash`, run
`update <name>`, read its full contents at the link it prints and, if you're
happy with it, run it again with `--write`.
