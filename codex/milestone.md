## Milestone Design Manual

This document is a formal GitHub **milestone** design manual.

It states a set of rules and recommendations, which are expected to be followed by all project participants when adding a new **milestone** to ensure uniformity of all **milestones**.

**1.** All **milestones** ***SHOULD*** be stored in the `.github/milestones.yml` YAML file.

**2.** `.github/milestones.yml` is a multi-document YAML file described by [milestone.schema.yml](../schemas/milestone.schema.yml).

**3.** Each document inside the multi-document YAML file `.github/milestones.yml` ***MUST*** start with a reference to its schema using special YAML comment syntax:

```yml
# yaml-language-server: $schema=RELATIVE_PATH_TO_SCHEMA
```

`RELATIVE_PATH_TO_SCHEMA` is the relative path to the corresponding schema inside the `node_modules` folder.

For instance: if `node_modules` is on the same level as `.github`, then `../node_modules/@aliaksandarpratashchyk/kickcat/schemas/milestone.schema.yml` is the relative path to the milestone schema.

**4.** All documents in `.github/milestones.yml` are divided into two categories: already synchronized with GitHub and new ones.

Already synchronized documents have a special YAML `hash` comment immediately after the `yaml-language-server` schema comment. This `hash` comment ***CANNOT*** be edited manually; KickCat manages it automatically.

**5.** [milestone.schema.yml](../schemas/milestone.schema.yml) uses an extended JSON Schema format that can define the **order** of properties inside YAML documents. All YAML documents ***MUST*** follow the property order specified by their schema.

**6.** The **milestone** `number` is assigned automatically by GitHub during synchronization stage and ***MUST NOT*** be edited manually.

**7.** The **milestone** `title` ***SHOULD*** follow these conventions:

- Start with a Unicode icon prefix that matches the title meaning.
- Follow with a version number, such as `v1.0.0`, to reference the target version for implementation.
- Follow with a title in Title Case.

For example: `🚀 v1.0.0 - Project Setup & Raw Implementation`

**8.** The **milestone** `description` is multi-line Markdown with this structure:

- Start with a short introduction.
- Follow with a `Goal` section that clearly and briefly states why the milestone exists. Visually, this section should start with the `### 🎯 Goal` header.
- End with an `Outcomes` section that lists expected implementation outcomes. Visually, this section should start with the `### ✅ Outcomes` header.

Below is an example description for **milestone** `🚀 v1.0.0 - Project Setup & Raw Implementation`:

```markdown
Initialize the repository structure and developer tooling for the project.

Scaffold the first usable implementation.

### 🎯 Goal
Establish a foundation for further improvements.

### ✅ Outcomes
- Project scaffolded (README, workflows)
- Raw implementation added
```
