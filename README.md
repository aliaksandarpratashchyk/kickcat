# ⚙️ KickCat - GitHub metadata IaC CLI

KickCat is a CLI for keeping GitHub metadata (milestones, labels, and issues) as YAML. It reads and writes multi-document YAML files, preserves schema/hash comments and ordering, and offers commands to pull, push, delete, and repair entries between a local and a remote store.

> GitHub API binding is not wired yet. Commands that touch a remote require a YAML file/folder via `--remote-storage` or `KICKCAT_REMOTE_STORAGE`; otherwise the command fails.

## What it does
- Store milestones, labels, and issues as YAML with `$schema` + `hash` comments and schema-driven field ordering.
- Hash-aware pull/push between local and remote stores: new entries are created remotely, remote-only entries delete the local copy, matching hashes are skipped, conflicts pull remote data back into local.
- Two-pass push resolves references (issues → milestones/labels/issues) to primary keys before updating the remote, then syncs the final state back to local.
- Delete entities locally with optional dependency cleanup to avoid dangling references.
- Repair storages by rewriting YAML, recalculating hashes, and normalizing ordering/comments.
- Works with a single YAML file or a folder; folders fall back to `hub.yml`/`shared.yml` if an entity-specific file is not present.

## Install & build
- `npm install`
- `npm run build` (outputs `dist/bundle.js`)
- Run via `node dist/bundle.js …` or `npx kickcat …` after building.

## Running the CLI
Common options:
- `--log-level [debug|info|warn|error|off]` (default: `off`)
- `--help` on any command shows contextual help.

Storage options:
- `--local-storage` or `KICKCAT_LOCAL_STORAGE`: path to local YAML file/folder (defaults to the current working directory).
- `--remote-storage` or `KICKCAT_REMOTE_STORAGE`: path to the remote YAML store (required for pull/push commands until GitHub binding exists).

Entity types currently registered: `milestone`, `label`, `issue`.

## Commands
- `help [--command=<path>]` — list commands or show details for a specific path.
- `entity pull --of=<entity> --key=<field> --value=<value> [--local-storage=…] --remote-storage=…`  
  Pull a single entity from the remote store into local storage (overwrites the local copy, warns if its saved hash differs from the calculated hash).
- `entity push all [--of=<entity>] [--local-storage=…] --remote-storage=… [--force]`  
  Push everything (or a single entity type) from local to remote with hash-based conflict handling; `--force` ignores hash equality and always pushes local data.
- `entity delete --of=<entity> --key=<field> --value=<value> [--local-storage=…] [--correct-dependencies=<true|false>]`  
  Delete a single entity from local storage; by default also drops references from other entities.
- `repair [--local-storage=…]`  
  Rewrite local storage to refresh hashes and formatting.

### Examples
- Pull milestone `number: 1` into your local store:  
  `node dist/bundle.js entity pull --of=milestone --key=number --value=1 --local-storage=./hub.yml --remote-storage=./remote.yml`
- Push all labels from local to remote with verbose logs:  
  `node dist/bundle.js entity push all --of=label --local-storage=./hub.yml --remote-storage=./remote.yml --log-level=info`
- Push issues even when hashes match (force):  
  `node dist/bundle.js entity push all --of=issue --force --local-storage=./hub.yml --remote-storage=./remote.yml`
- Delete a local label named `chore` and clean dependents:  
  `node dist/bundle.js entity delete --of=label --key=name --value=chore --local-storage=./hub.yml`
- Normalize hashes/formatting in your local store:  
  `node dist/bundle.js repair --local-storage=./hub.yml`

## Storage format
Entities are stored as separate YAML documents. Each document keeps schema and hash metadata in comments, and ordering follows the schema definition:

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

KickCat preserves these comments during parsing and uses the hashes to decide whether to update local or remote entries during sync.
