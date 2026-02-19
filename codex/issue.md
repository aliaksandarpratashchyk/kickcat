## Issue Design Manual

This document is a formal GitHub **issue** design manual.

It states a set of rules and recommendations, which are expected to be followed by all project participants when adding a new **issue** to ensure uniformity of all **issues**.

**1.** All **issues** ***SHOULD*** be stored in the `.github/issues.yml` YAML file.

**2.** `.github/issues.yml` is a multi-document YAML file described by [issue.schema.yml](../schemas/issue.schema.yml).

**3.** Each document inside the multi-document YAML file `.github/issues.yml` ***MUST*** start with a reference to its schema using special YAML comment syntax:

```yml
# yaml-language-server: $schema=RELATIVE_PATH_TO_SCHEMA
```

`RELATIVE_PATH_TO_SCHEMA` is the relative path to the corresponding schema inside the `node_modules` folder.

For instance: if `node_modules` is on the same level as `.github`, then `../node_modules/@aliaksandarpratashchyk/kickcat/schemas/issue.schema.yml` is the relative path to the issue schema.

**4.** All YAML documents in `.github/issues.yml` are divided into two categories: already synchronized with GitHub and new ones.

Already synchronized documents have a special YAML `hash` comment immediately after the `yaml-language-server` schema comment. This `hash` comment ***CANNOT*** be edited manually; KickCat manages it automatically.

**5.** [issue.schema.yml](../schemas/issue.schema.yml) uses an extended JSON Schema format that can define the **order** of properties inside YAML documents. All YAML documents ***MUST*** follow the property order specified by their schema.

**6.** The **issue** `number` is assigned automatically by GitHub during synchronization stage and ***MUST NOT*** be edited manually.

**7.** The **issue** `title` ***SHOULD*** follow a semantic commit style, with an optional scope for monorepos.

If an **issue** is epic and effectively equivalent to a **milestone**, the **issue** `title` ***SHOULD*** use the same icon prefix as the **milestone**.

For instance: `🚀 feat: setup project and scaffold raw implementation` for **milestone** `🚀 v1.0.0 - Project Setup & Raw Implementation`.

**8.** The **issue** `milestone` property ***MUST*** reference the associated milestone, if an **issue** has one.

It can be either:

- **Milestone** `number`, if the **milestone** is already synchronized with GitHub and has a `number`.
- **Milestone** `title`, if the **milestone** is new and does not yet have a `number`. The KickCat utility will replace it with `number` during synchronization.

**9.** The **issue** `labels` property is a list of **labels** associated with the **issue**. Label `name` is used as the **label** identifier.

**10.** The **issue** `state` property is either `open` or `closed`. For a new **issue**, it ***CAN*** be omitted.

**11.** The **issue** `dependencies` property is a list of **issues** that this **issue** depends on. These **issues** ***MUST*** be closed before this **issue** can be closed. As issue identifiers in this list, either:

- **Issue** `number` ***MUST*** be used if the **issue** is already synchronized with GitHub.
- **Issue** `title` ***MUST*** be used if the **issue** is new and does not yet have a `number`.

**12.** The issue `description` property is multi-line Markdown text with this structure:

- Start with a short introduction of the **issue**.
- Follow with a `Goal` section where the purpose of the **issue** is clearly stated. Visually, this section ***SHOULD*** be marked with the `## 🎯 Goal` header.
- Follow with an optional `Subtasks` section, used when the **issue** is large and can be split into subtasks. Visually, this section ***SHOULD*** be marked with the `## 🧩 Subtasks` header.
- End with an `Outcomes` section that states expected results after the **issue** is closed. Visually, this section ***SHOULD*** be marked with the `## ✅ Outcomes` header.

Below is an example description for **issue** `🚀 feat: setup project and scaffold raw implementation`:

```markdown
Set up the project tooling and scaffold the raw implementation of the project.

## 🎯 Goal
Ship a small but complete v1 foundation.

## 🧩 Subtasks
- Set up NPM project
- Configure GitHub workflows
- Implement initial course structure:
  - Episode scripts
  - Code snippets

## ✅ Outcomes
- Workflows are present
- Structured raw implementation is added
```
