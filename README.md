# ⚙️ KickCat - GitHub Workflow Automation Toolkit

A reusable **Infrastructure-as-Code toolkit** for GitHub repository automation.  
This package provides **bundled GitHub Actions workflows**, **JS helper scripts**, and a simple **CLI installer** to quickly bootstrap or sync automation in any repository.

Designed to eliminate manual setup time for:

- 🗂 Milestones (sync, remove, diff output, emoji summaries)
- 🏷 Labels (IaC-driven label definitions, validation)
- 📊 Projects (Classic & Projects v2 support, column sync, description sync)
- 📄 JSON schema validation
- 📝 GitHub summary generation (diff-based, rich tables, status indicators)
- 🔧 Workflow utilities extracted from YAML into clean TypeScript modules

---

## ✨ Features

### 🔁 Reusable Workflows

Include prebuilt workflows by installing this package and dropping them into `.github/workflows`:

- **Milestone Sync**
- **Label Sync**
- **Project Board Sync**
- **Project Description Sync**
- **YAML-Driven IaC for project configuration**
- **JSON Validation**
- **Diff Summary Tables**
- **Side-by-side change visualizer**  
  …and more.

### 💡 JS Utilities

Clean TypeScript/JavaScript utilities extracted from workflow bodies:

- GitHub API clients
- diff generators
- table renderers
- rich summary builders
- file loaders (folder or single file)
- key extractors from titles (e.g., `[Key] …`)

### 🖥 CLI Installer

Install workflows into any repo via:

```sh
npx workflow-automation install
```
