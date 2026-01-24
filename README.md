# ⚙️ KickCat – GitHub metadata IaC CLI

![Tests](https://github.com/aliaksandarpratashchyk/kickcat/actions/workflows/unit-tests.yml/badge.svg)
[![Coverage](./coverage.svg)](./COVERAGE.md)
![E2E](https://github.com/aliaksandarpratashchyk/kickcat/actions/workflows/e2e-tests.yml/badge.svg)

KickCat keeps GitHub metadata (milestones, labels, issues) as YAML and syncs it with a GitHub repository or a file-based store. It preserves schema-driven ordering and hash comments so you can review changes as code.

## What it does

- Manage milestones, labels, and issues as YAML with `$schema` + `hash` comments.
- Sync between local YAML and GitHub: new entities are created, remote-only entities delete the local copy, matching hashes are skipped, conflicts pull remote data back locally.
- Two-pass push resolves references (issue → milestone/label/issue) to primary keys, then syncs the final state back to local.
- Delete entities locally with optional dependency cleanup and repair storages by recalculating hashes/ordering.
- Works with a single YAML file or a folder; falls back to `hub.yml`/`shared.yml` when entity files are missing.
- Ships reusable GitHub Actions workflows (install via the `setup` command).

## Install & build

- `npm install`
- `npm run build` (outputs `dist/bundle.js`)
- Run via `npx kickcat …` or `npx kickcat …` after building.

## Configuration

- **Logging:** `--log-level [debug|info|warn|error|off]` (default: `off`)
- **Local storage:** `--local-storage` or `KICKCAT_LOCAL_STORAGE` (YAML file/folder, defaults to `./.github`).
- **Remote storage:**
  - GitHub (default): set `GITHUB_TOKEN` (or pass `--git-hub-token`) and repo/owner derived from the current git remote or `GITHUB_REPOSITORY`.
  - File-based: `--remote-storage` or `KICKCAT_REMOTE_STORAGE` to point at another YAML file/folder.

Registered entity types: `milestone`, `label`, `issue`.

## Commands

- `help [--command=<path>]` — list commands or show details.
- `setup [--rewrite]` — copy bundled workflows from `templates/workflows` into `.github/workflows` (skips existing files unless `--rewrite`).
- `entity pull --of=<entity> --key=<field> --value=<value> [--local-storage=…] [--remote-storage=…]` — pull one entity from remote into local.
- `entity push all [--of=<entity>] [--local-storage=…] [--remote-storage=…] [--force]` — push everything (or one type) from local to remote with hash-aware conflict handling; `--force` always pushes local data.
- `entity delete --of=<entity> --key=<field> --value=<value> [--local-storage=…] [--correct-dependencies=<true|false>]` — delete locally and optionally clean references.
- `repair [--local-storage=…]` — rewrite local storage to refresh hashes/ordering.

### Examples

- Pull milestone `number: 1` into local:  
  `npx kickcat entity pull --of=milestone --key=number --value=1 --local-storage=./hub.yml`
- Push all labels to GitHub with verbose logs:  
  `npx kickcat entity push all --of=label --log-level=info`
- Force-push issues even when hashes match:  
  `npx kickcat entity push all --of=issue --force`
- Delete a local label named `chore` and clean dependents:  
  `npx kickcat entity delete --of=label --key=name --value=chore --local-storage=./hub.yml`
- Install bundled workflows into your repo:  
  `npx kickcat setup --rewrite`
- Normalize hashes/formatting in your local store:  
  `npx kickcat repair --local-storage=./hub.yml`

## Storage format

Entities are stored as separate YAML documents with schema/hash metadata and schema-driven ordering:

```yaml
# type: milestone
# yaml-language-server: $schema=../schemas/milestone.schema.yml
# hash: 4fa572887b9ba72d4e9dc8d9b9f1ddc4
number: 1
title: Planning
dueDate: 2024-01-05
state: closed
description: |
  …

---
# type: label
# yaml-language-server: $schema=../schemas/label.schema.yml
# hash: f2cdb191e760308bcda9a7be56d83c51
name: priority:high
color: d73a4a
description: High priority work

---
# type: issue
# yaml-language-server: $schema=../schemas/issue.schema.yml
# hash: 2b88953d87ea3a49de9591c1173ccf8c
number: 12
title: Implement milestone sync
milestone: 1
labels:
  - priority:high
dependencies: []
description: |
  Sync GitHub milestones with local YAML state.
```

KickCat preserves these comments and uses hashes to decide whether to update local or remote entries during sync.\*\*\*
