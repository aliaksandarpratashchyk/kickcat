# ⚙️ KickCat - Milestone Sync CLI

KickCat is a small CLI that treats GitHub milestones as infrastructure‑as‑code. It reads and writes milestones from YAML files, keeps hashes in comments, and offers simple commands to sync a "local" file store with a "remote" one.

> GitHub API integration is stubbed out; today the remote store must be another YAML location passed via `--remote-storage` or `KICKCAT_REMOTE_STORAGE`.

## What it does
- Store milestones as YAML (multi‑document) with schema metadata and content hashes.
- Pull a single milestone from a remote store into the local one.
- Push all local milestones to the remote store with hash-based conflict handling.
- Delete milestones locally.
- Repair/rewrite local files to fix formatting or hash issues.

## Install & build
- `npm install`
- `npm run build` (produces `dist/bundle.js`)

## Usage
Run commands with `node dist/bundle.js …` after building.

- `node dist/bundle.js help`
- `node dist/bundle.js milestone pull --number=1 --local-storage=./milestones.yml --remote-storage=./remote.yml`
- `node dist/bundle.js milestone push all --local-storage=./milestones.yml --remote-storage=./remote.yml`
- `node dist/bundle.js milestone delete --number=1 --local-storage=./milestones.yml`
- `node dist/bundle.js repair --local-storage=./milestones.yml`

### Options and defaults
- `--local-storage` or `KICKCAT_LOCAL_STORAGE`: path to the local YAML file/folder (defaults to the current working directory).
- `--remote-storage` or `KICKCAT_REMOTE_STORAGE`: path to the remote YAML store (required until GitHub binding is implemented).
- `--git-hub-token` or `GITHUB_TOKEN`: stored for future GitHub support; not used when remote storage is a file path.

## Storage format
Milestones are stored as separate YAML documents. Each document carries a header comment with the schema path, an optional type tag, and a hash:

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
```

KickCat preserves these comments during parsing and uses them to decide whether to overwrite or update milestones when syncing.
