# 🚀 Bumper

> 🚀 A magical release management system with beautiful changelogs and automated workflows

[![npm version](https://badge.fury.io/js/bumper.svg)](https://badge.fury.io/js/bumper)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Bumper is a modern, developer-friendly tool that automates your entire release process. From conventional commit validation to beautiful changelog generation, automated version bumping, and seamless GitHub releases - it handles everything with style.

## ✨ Features

- 🎯 **Zero Configuration** - Works out of the box with sensible defaults
- 📝 **Beautiful Changelogs** - Auto-generated with emojis and smart categorization
- 🔍 **Commit Validation** - Enforces conventional commit standards
- 🚀 **Automated Releases** - One command to rule them all
- 🎨 **Beautiful UX** - Colorful output with spinners and progress indicators
- 🔧 **GitHub Integration** - Automatic releases and workflow setup
- 🐕 **Git Hooks** - Pre-commit validation with Husky
- 📦 **NPM Publishing** - Seamless package publishing
- 🎪 **Platform Agnostic** - Works with any Git-based project

## 🚀 Quick Start

### Installation Options

#### Global Installation (Recommended for CLI usage)

```bash
npm install -g bumper-cli
```

#### Per-Project Installation (Recommended for project-specific usage)

```bash
npm install --save-dev bumper-cli
```

### Setup Your Project

```bash
# Initialize bumper in your project
bumper setup
# or if installed locally:
npx bumper setup
```

This will:

- Install necessary dependencies
- Create conventional commit validation
- Set up Git hooks with Husky
- Create GitHub Actions workflow
- Add NPM scripts to your package.json
- Generate initial changelog

### Make Your First Release

#### Using NPM Scripts (Recommended)

```bash
# Preview what your release will look like
npm run changelog:preview

# Create a patch release
npm run release:patch
```

#### Using CLI Directly

```bash
# If installed globally
bumper release patch

# If installed locally
npx bumper release patch
```

## 📖 Usage

### CLI Commands

```bash
# Preview your next release
bumper preview
# or: npx bumper preview

# Generate changelog
bumper generate
# or: npx bumper generate

# Validate commit messages
bumper validate
# or: npx bumper validate

# Create a release
bumper release <type> [--dry-run]
# or: npx bumper release <type> [--dry-run]

# Setup project
bumper setup
# or: npx bumper setup
```

### NPM Scripts

After setup, these convenience scripts are added to your package.json:

```json
{
  "scripts": {
    "validate:commits": "./node_modules/.bin/bumper validate",
    "changelog:preview": "./node_modules/.bin/bumper preview",
    "changelog:generate": "./node_modules/.bin/bumper generate",
    "release:patch": "./node_modules/.bin/bumper release patch",
    "release:minor": "./node_modules/.bin/bumper release minor",
    "release:major": "./node_modules/.bin/bumper release major",
    "release:dry-run": "./node_modules/.bin/bumper release patch --dry-run"
  }
}
```

**Usage:**

```bash
# Main bumper command (automatically available when installed locally)
npm run bumper preview
npm run bumper validate
npm run bumper release patch
npm run bumper release minor --dry-run

# Or use the convenience scripts
npm run changelog:preview
npm run release:patch
```

**Note**: `npm run bumper` is automatically available thanks to the `bin` field in the package.json!

### Installation Methods Comparison

| Method | Pros | Cons | Best For |
|--------|------|------|----------|
| **Global** | Always available, no npx needed | Version conflicts, global pollution | CLI tools, personal projects |
| **Per-Project** | Version control, team consistency, isolation | Requires npx or npm scripts | Teams, production projects |

## 🎯 Conventional Commits

Bumper follows the [Conventional Commits](https://conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Supported Types

| Type       | Emoji | Description              |
| ---------- | ----- | ------------------------ |
| `feat`     | ✨    | New features             |
| `fix`      | 🐛    | Bug fixes                |
| `docs`     | 📚    | Documentation            |
| `style`    | 💄    | Code style changes       |
| `refactor` | ♻️    | Code refactoring         |
| `perf`     | ⚡    | Performance improvements |
| `test`     | ✅    | Adding tests             |
| `build`    | 📦    | Build system changes     |
| `ci`       | 🔧    | CI/CD changes            |
| `chore`    | 🔨    | Maintenance tasks        |
| `revert`   | ⏪    | Reverting changes        |
| `security` | 🔒    | Security fixes           |

### Examples

```bash
# Feature
git commit -m "feat: add user authentication"

# Bug fix
git commit -m "fix: resolve login timeout issue"

# Breaking change
git commit -m "feat!: change API response format"

# With scope
git commit -m "feat(auth): add OAuth2 support"
```

## 📋 Changelog Generation

Bumper automatically generates beautiful changelogs with:

- 📊 **Smart Categorization** - Groups commits by type with emojis
- ⚠️ **Breaking Changes** - Highlights breaking changes prominently
- 👥 **Contributors** - Credits all contributors
- 🎨 **Beautiful Formatting** - Clean, readable output

### Example Output

```markdown
## [1.2.0] - 2024-01-15 (MINOR RELEASE)

### ⚠️ BREAKING CHANGES

- **auth:** change login endpoint response format (a1b2c3d4)

### ✨ Features

- **auth:** add OAuth2 support (e5f6g7h8)
- **ui:** implement dark mode toggle (i9j0k1l2)

### 🐛 Bug Fixes

- **api:** fix pagination bug (m3n4o5p6)
- **ui:** resolve mobile layout issues (q7r8s9t0)

### 👥 Contributors

Thanks to John Doe, Jane Smith for contributing to this release!
```

## 🔧 Configuration

### Commitlint Configuration

The setup creates a `commitlint.config.json` file:

```json
{
  "extends": ["@commitlint/config-conventional"],
  "rules": {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "perf",
        "test",
        "build",
        "ci",
        "chore",
        "revert",
        "security"
      ]
    ],
    "type-case": [2, "always", "lower"],
    "type-empty": [2, "never"],
    "subject-case": [2, "always", "lower"],
    "subject-empty": [2, "never"],
    "subject-full-stop": [2, "never", "."],
    "header-max-length": [2, "always", 72]
  }
}
```

### GitHub Actions Workflow

Automatically creates `.github/workflows/release.yml` for automated releases.

## 🎪 API Reference

### Programmatic Usage

```typescript
import {
  generateChangelog,
  validateCommits,
  createRelease,
} from 'bumper';

// Generate changelog
await generateChangelog({ preview: true });

// Validate commits
const result = await validateCommits();

// Create release
const release = await createRelease({
  type: 'patch',
  dryRun: true,
});
```

### Types

```typescript
interface Commit {
  hash: string;
  type: string;
  scope?: string;
  subject: string;
  breaking?: boolean;
  author: string;
  date: string;
}

interface ReleaseResult {
  success: boolean;
  version: string;
  tag: string;
  changelog: string;
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feat/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Conventional Commits](https://conventionalcommits.org/) for the commit specification
- [Keep a Changelog](https://keepachangelog.com/) for the changelog format
- [Husky](https://typicode.github.io/husky/) for Git hooks
- [Commitlint](https://commitlint.js.org/) for commit validation

---

Made with ❤️ by developers, for developers.
