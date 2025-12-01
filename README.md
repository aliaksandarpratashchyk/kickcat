# ⚙️ KickCat - GitHub metadata IaC CLI

KickCat is a tiny CLI for keeping GitHub repository metadata (milestones and labels) as YAML. It reads and writes multi-document YAML files, preserves schema and hash comments, and offers commands to pull, push, delete, and repair entries between a local and a remote store.

> GitHub API binding is not wired yet; remote storage must be another YAML location provided via `--remote-storage` or `KICKCAT_REMOTE_STORAGE`.

## What it does
- Store milestones and labels as YAML with `$schema` + `hash` comments and stable field ordering.
- Pull one entity from a remote store into the local one (overwrites the local copy, warns if its saved hash differs from its calculated hash).
- Push all local entities to the remote store with hash-based reconciliation (new local entries are created remotely, remote-only entries delete the local copy, matching hashes are skipped, diverged hashes pull remote data back to local).
- Delete an entity from local storage.
- Repair local storage by rewriting YAML, recalculating hashes, and normalizing ordering/comments.

## Install & build
- `npm install`
- `npm run build` (outputs `dist/bundle.js`)

## Running the CLI
Invoke commands with `node dist/bundle.js <command> [options]`.

Common options:
- `--log-level [debug|info|warn|error|off]` (default: `off`)
- `--help` on any command shows contextual help.

Storage options:
- `--local-storage` or `KICKCAT_LOCAL_STORAGE`: path to local YAML file/folder (defaults to the current working directory).
- `--remote-storage` or `KICKCAT_REMOTE_STORAGE`: path to the remote YAML store (required for commands that touch remote storage until GitHub binding exists).

Entity types currently registered: `milestone`, `label`.

## Commands
- `help [--command=<path>]` — list commands or show details for a specific path.
- `entity pull --of=<entity> --key=<field> --value=<value> [--local-storage=…] --remote-storage=…`
  - Pull a single entity from the remote store into local storage.
- `entity push all [--of=<entity>] [--local-storage=…] --remote-storage=…`
  - Push everything (or only one entity type) from local to remote with hash-based conflict handling and commit both storages.
- `entity delete --of=<entity> --key=<field> --value=<value> [--local-storage=…]`
  - Delete a single entity from local storage.
- `repair [--local-storage=…]`
  - Rewrite local storage to refresh hashes and formatting.

### Examples
- Pull milestone `number: 1` into your local store:  
  `node dist/bundle.js entity pull --of=milestone --key=number --value=1 --local-storage=./hub.yml --remote-storage=./remote.yml`
- Push all labels from local to remote with verbose logs:  
  `node dist/bundle.js entity push all --of=label --local-storage=./hub.yml --remote-storage=./remote.yml --log-level=info`
- Delete a local label named `chore`:  
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
```

KickCat preserves these comments during parsing and uses the hashes to decide whether to update local or remote entries during sync.
