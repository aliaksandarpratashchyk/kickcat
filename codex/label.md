## Label Design Manual

This document is a formal GitHub **label** design manual.

It states a set of rules and recommendations, which are expected to be followed by all project participants when adding a new **label** to ensure uniformity of all **labels**.

**1.** All **labels** ***SHOULD*** be stored in the `.github/labels.yml` YAML file.

**2.** `.github/labels.yml` is a multi-document YAML file described by [label.schema.yml](../schemas/label.schema.yml).

**3.** Each document inside the multi-document YAML file `.github/labels.yml` ***MUST*** start with a reference to its schema using special YAML comment syntax:

```yml
# yaml-language-server: $schema=RELATIVE_PATH_TO_SCHEMA
```

`RELATIVE_PATH_TO_SCHEMA` is the relative path to the corresponding schema inside the `node_modules` folder.

For instance: if `node_modules` is on the same level as `.github`, then `../node_modules/@aliaksandarpratashchyk/kickcat/schemas/label.schema.yml` is the relative path to the label schema.

**4.** All documents in `.github/labels.yml` are divided into two categories: already synchronized with GitHub and new ones.

Already synchronized documents have a special YAML `hash` comment immediately after the `yaml-language-server` schema comment. This `hash` comment ***CANNOT*** be edited manually; KickCat manages it automatically.

**5.** [label.schema.yml](../schemas/label.schema.yml) uses an extended JSON Schema format that defines the **order** of properties inside YAML documents. All YAML documents ***MUST*** follow the specified property order.

**6.** The set of **labels** ***SHOULD*** be designed based on current repository or project needs, in an amount sufficient to describe current issues and the project specifics.

For a typical coding project, examples include `priority:low`, `priority:medium`, `priority:high`, `type:feature`, and `type:bug`.

For a monorepo, `scope` category **labels** can be added.

For non-coding projects, such as writing-focused projects, `priority` **labels** can still be useful, but `type` **labels** ***SHOULD*** be designed according to project needs.

**7.** The label `name` ***MUST*** start with a category prefix, separated with a colon `:` from the rest of the name. Typical category prefixes:

- `priority` - used by **labels** that specify feature criticality or urgency, for example `priority:low` or `priority:high`.
- `type` - used by **labels** that specify issue type, for example `type:feature` or `type:fix`.
- `scope` - used in monorepos to specify a project or package.

For instance, `scope:client` and `scope:server` can be used for a simple client-server application. In a single-project repository, `scope` **labels** ***SHOULD NOT*** be used.

**8.** The **label** `color` ***SHOULD*** match the meaning of the label.

For instance, `priority` labels can follow a traffic-light metaphor: red for `priority:high`, yellow for `priority:medium`, and green for `priority:low`.

**9.** The **label** `description` ***SHOULD*** be short but clear enough to explain the label.
