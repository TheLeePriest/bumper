# 🚀 Bumper

> 🚀 A magical release management system with beautiful changelogs and automated workflows

[![npm version](https://img.shields.io/npm/v/bumper-cli.svg?style=flat-square)](https://www.npmjs.com/package/bumper-cli)
[![npm downloads](https://img.shields.io/npm/dm/bumper-cli.svg?style=flat-square)](https://www.npmjs.com/package/bumper-cli)
[![GitHub stars](https://img.shields.io/github/stars/TheLeePriest/bumper?style=flat-square)](https://github.com/TheLeePriest/bumper/stargazers)
[![CI](https://github.com/TheLeePriest/bumper/actions/workflows/release.yml/badge.svg)](https://github.com/TheLeePriest/bumper/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Bumper is a modern, developer-friendly tool that automates your entire release process. From conventional commit validation to beautiful changelog generation, automated version bumping, and seamless GitHub releases - it handles everything with style.

## ✨ Features

### 🚀 **Core Release Management**
- **Automated Releases** - One command creates tags, changelogs, and GitHub releases
- **Smart Versioning** - Automatic patch/minor/major version bumping
- **Beautiful Changelogs** - Auto-generated with emojis and smart categorization
- **NPM Publishing** - Seamless package publishing with authentication

### 🔍 **Commit Management**
- **Commit Validation** - Enforces conventional commit standards
- **Interactive Commits** - Guided commit message creation
- **Commit Suggestions** - AI-powered commit message improvements
- **Git Hooks** - Pre-commit validation with Husky

### 🏷️ **GitHub Integration**
- **Auto-Labeling** - Automatically label PRs based on commit messages
- **Release Readiness** - Validate releases based on GitHub labels and requirements
- **Enhanced Changelogs** - Group changelog entries by labels for better organization
- **Workflow Automation** - GitHub Actions for seamless integration

### 🎯 **Developer Experience**
- **Zero Configuration** - Works out of the box with sensible defaults
- **Beautiful UX** - Colorful output with spinners and progress indicators
- **Platform Agnostic** - Works with any Git-based project
- **Flexible Configuration** - Customize everything via `bumper.config.json`

## 🚀 Quick Start

### 1. Install Bumper

**Recommended: Per-Project Installation**

```bash
npm install --save-dev bumper-cli
```

**Alternative: Global Installation**

```bash
npm install -g bumper-cli
```

### 2. Setup Your Project

```bash
# Initialize bumper in your project
bumper setup
# or if installed locally:
npx bumper setup
```

This will:

- ✅ Install necessary dependencies (`@commitlint/cli`, `husky`)
- ✅ Create conventional commit validation rules
- ✅ Set up Git hooks with Husky
- ✅ Create GitHub Actions workflow
- ✅ Add convenient NPM scripts to your package.json
- ✅ Generate initial changelog

### 3. Make Your First Release

```bash
# Preview what your release will look like
npm run changelog:preview

# Create a patch release
npm run release:patch
```

## 🔄 Legacy Project Migration

If you have an existing project that doesn't follow conventional commit format, bumper provides powerful tools to help you migrate. You can choose between **invasive migration** (rewriting history) or **non-invasive migration** (drawing a line in the sand).

### 🏖️ Non-Invasive: Line in the Sand (Recommended)

The safest approach is to draw a line in the sand and start fresh with conventional commits from a specific point forward:

```bash
# Start using conventional commits from now on
bumper line-in-sand

# Start from a specific date
bumper line-in-sand --start-date 2024-01-01

# Start from a specific commit
bumper line-in-sand --start-commit abc12345

# Start from a specific tag
bumper line-in-sand --tag v1.0.0
```

**Benefits:**
- ✅ **No git history rewriting** - completely safe
- ✅ **Immediate setup** - start using conventional commits right away
- ✅ **Team friendly** - no coordination needed
- ✅ **Gradual adoption** - legacy commits remain unchanged
- ✅ **Changelog support** - works with mixed commit formats

**What happens:**
- Sets up conventional commit infrastructure
- Creates a marker file and git tag to track the start point
- All new commits from that point forward use conventional format
- Legacy commits remain unchanged but are still included in changelogs
- Commit validation is active for new commits only

### 🔧 Invasive: Full Migration

For projects that want to convert all existing commits to conventional format:

### 1. Analyze Your Current State

```bash
# Analyze commit patterns in your project
bumper analyze-legacy

# Analyze specific commit range
bumper analyze-legacy --range HEAD~100..HEAD

# Save analysis to file
bumper analyze-legacy --output analysis.json
```

This will show you:
- 📊 Commit statistics and migration rate
- 📋 Common commit patterns and suggested types
- 💡 Recommended migration strategy
- 🎯 Next steps for your project

### 2. Migrate Your Project

```bash
# Migrate project to conventional commits
bumper migrate-legacy

# Force migration even if already set up
bumper migrate-legacy --force

# Migrate commits from a specific date
bumper migrate-legacy --start-date 2024-01-01
```

This will:
- ✅ Install conventional commit dependencies
- ✅ Set up commitlint and husky hooks
- ✅ Add convenient npm scripts
- ✅ Configure validation rules

### 3. Bulk Format Legacy Commits

```bash
# Preview bulk formatting
bumper bulk-format --dry-run

# Format commits in a specific range
bumper bulk-format --range HEAD~50..HEAD

# Apply formatting (rewrites git history)
bumper bulk-format
```

**⚠️ Warning:** Bulk formatting rewrites git history. Always backup your repository first!

### 4. Gradual Migration Strategy

For large projects, consider a gradual approach:

1. **Start with new commits** using `bumper commit` or `bumper suggest`
2. **Format recent commits** with `bumper bulk-format --range HEAD~20..HEAD`
3. **Analyze progress** with `bumper analyze-legacy`
4. **Repeat** until migration is complete

### Migration Strategies

Bumper automatically suggests the best migration strategy:

- **Line in the Sand**: **Recommended** - Start fresh from a specific point (non-invasive)
- **Bulk**: For projects with < 50 legacy commits (invasive)
- **Hybrid**: For projects with mixed conventional/legacy commits (invasive)
- **Gradual**: For large projects with > 100 legacy commits (invasive)

### When to Use Each Approach

| Approach | Best For | Risk Level | Team Coordination |
|----------|----------|------------|-------------------|
| **Line in the Sand** | Most projects | 🟢 None | None needed |
| **Bulk** | Small projects, solo developers | 🟡 Medium | Minimal |
| **Gradual** | Large projects, teams | 🟡 Medium | Moderate |
| **Hybrid** | Mixed commit history | 🟡 Medium | Moderate |

## 📖 Usage Guide

### 🎯 Installation Methods

| Method | Install Command | Usage Command | Works In | Best For |
|--------|----------------|---------------|----------|----------|
| **Per-Project** | `npm install --save-dev bumper-cli` | `npm run <script>` | Project directory only | **Teams, production projects** |
| **Global** | `npm install -g bumper-cli` | `bumper <command>` | Any directory | CLI tools, personal use |

### 🔍 CLI Commands Reference

```bash
# Preview your next release
bumper preview

# Validate commit messages
bumper validate

# Generate changelog
bumper generate

# Create a release
bumper release <type> [--dry-run]
# Types: patch, minor, major

# Setup project (adds convenience scripts)
bumper setup

# Suggest commit format
bumper suggest "your message"

# Interactive commit creation
bumper commit

# GitHub integration
bumper setup-github
bumper check-release-readiness
bumper auto-label <pr-number>

# Legacy project migration
bumper line-in-sand [--start-date <date>] [--start-commit <commit>] [--tag <tag>] [--force]
bumper analyze-legacy [--range <range>] [--output <file>]
bumper migrate-legacy [--force] [--start-date <date>]
bumper bulk-format [--range <range>] [--dry-run]
```

### 📦 NPM Scripts (After Setup)

After running `bumper setup`, these convenience scripts are added to your package.json:

```json
{
  "scripts": {
    "validate:commits": "bumper validate",
    "changelog:preview": "bumper preview",
    "changelog:generate": "bumper generate",
    "release:patch": "bumper release patch",
    "release:minor": "bumper release minor",
    "release:major": "bumper release major",
    "release:dry-run": "bumper release patch --dry-run",
    "commit:suggest": "bumper suggest",
    "commit:create": "bumper commit",
    "github:setup": "bumper setup-github",
    "github:check": "bumper check-release-readiness",
    "github:label": "bumper auto-label",
    "legacy:analyze": "bumper analyze-legacy",
    "legacy:migrate": "bumper migrate-legacy",
    "legacy:format": "bumper bulk-format",
    "legacy:line-in-sand": "bumper line-in-sand"
  }
}
```

**Usage:**

```bash
# Convenience scripts (recommended)
npm run changelog:preview
npm run release:patch
npm run validate:commits
npm run commit:suggest "add login feature"
npm run commit:create
npm run github:check
npm run github:label 123
```

## 🏷️ GitHub Integration

Bumper's GitHub integration provides **auto-labeling**, **release validation**, and **enhanced changelogs** to streamline your workflow.

### 🚀 Quick Setup

```bash
# Setup GitHub integration (requires GitHub CLI)
bumper setup-github
```

**Creates:**
- `bumper.config.json` - Configuration file
- `.github/workflows/auto-label.yml` - Auto-labeling workflow
- Documentation and next steps

### 🏷️ Auto-Labeling PRs

**Command:** `bumper auto-label <pr-number>`

**What it does:** Analyzes commit messages in a PR and adds appropriate labels.

**Default mappings:**
- `feat` → `enhancement`
- `fix` → `bug`
- `security` → `security`
- `docs` → `documentation`

**Example:**
```bash
# PR #123 has commits: "feat: add login" and "fix: auth bug"
bumper auto-label 123
# Result: Adds "enhancement" and "bug" labels
```

**Automation:** The GitHub Actions workflow automatically labels PRs when they're opened or updated.

### 🔍 Release Readiness Validation

**Command:** `bumper check-release-readiness`

**What it checks:**
- ✅ No blocking labels on PRs since last release
- ✅ Required labels present (if configured)
- ✅ All PRs properly labeled
- ⚠️ Status checks (if configured)

**Example output:**
```
🔍 Checking release readiness...

❌ Release is not ready:
  • PR #123 has blocking label: do-not-release
  • PR #124 missing required label (ready-for-release)

📋 PRs since last release:
  • #123: Add new login feature [enhancement, do-not-release]
  • #124: Fix authentication bug [bug]
```

### 🏷️ Auto-Labeling

Automatically label PRs based on commit messages:

```bash
# Label a specific PR
bumper auto-label 123

# Or use the GitHub Actions workflow (automatic)
```

**Default mappings:**

- `feat` → `enhancement`
- `fix` → `bug`
- `security` → `security`
- `docs` → `documentation`

### ⚙️ Configuration

**File:** `bumper.config.json` (created by `bumper setup-github`)

**Key sections:**

**Release Requirements:**
```json
{
  "releaseRequirements": {
    "requiredLabels": ["ready-for-release", "qa-approved"],
    "blockingLabels": ["do-not-release", "wip", "block-release"],
    "requiredStatusChecks": ["ci", "test"]
  }
}
```

**Auto-Labeling:**
```json
{
  "autoLabel": {
    "enabled": true,
    "mappings": {
      "feat": ["enhancement"],
      "fix": ["bug"],
      "security": ["security"],
      "docs": ["documentation"]
    }
  }
}
```

**Enhanced Changelogs:**
```json
{
  "changelog": {
    "groupByLabels": true,
    "labelGroups": {
      "🚀 High Priority": ["high-priority", "critical"],
      "💥 Breaking Changes": ["breaking-change"],
      "🎨 User Facing": ["user-facing", "ui", "ux"]
    }
  }
}
```

**Enhanced changelog example:**
```markdown
## [1.5.7] - 2024-01-01

### 🚀 High Priority
- feat: add critical security feature (abc123)

### 🎨 User Facing
- feat: improve login UI (def456)

### 🔧 Internal
- refactor: optimize performance (ghi789)
```

### 🎯 Best Practices

**1. Essential Labels**
```bash
gh label create "ready-for-release" --color "28a745"
gh label create "do-not-release" --color "dc3545"
gh label create "qa-approved" --color "17a2b8"
gh label create "enhancement" --color "0075ca"
gh label create "bug" --color "d73a4a"
```

**2. Team Workflow**
```bash
# 1. Developer creates PR → Auto-labeling adds initial labels
# 2. QA reviews → Adds "qa-approved" label  
# 3. Before release → Run "bumper check-release-readiness"
# 4. If ready → Create release
# 5. If not ready → Fix issues (remove blocking labels, add required labels)
```

**3. Always validate before releasing**
```bash
bumper check-release-readiness
npm run release:patch
```

## ✨ Commit Formatting & Suggestions

Bumper helps you write beautiful, conventional commit messages!

### Suggest a Commit Format

Use the `suggest` command to get a conventional commit suggestion and improvement tips:

```bash
bumper suggest "add login button to UI"
```

**Output:**

```
💡 Commit Message Suggestions

Original: add login button to UI
Suggested: feat(ui): Add login button to ui

Improvements:
  • Convert to conventional commit format
  • Use scope for clarity

Type: feat
Scope: ui
```

### Interactive Commit Creation

Use the `commit` command for an interactive prompt to generate a conventional commit message:

```bash
bumper commit
```

You'll be guided through:

1. **Commit Type** - feat, fix, docs, etc.
2. **Scope** - optional component/module name
3. **Breaking Change** - whether this is a breaking change
4. **Description** - clear, concise description

Then copy the generated message into your `git commit -m` command.

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

## 💡 Best Practices

### 🎯 Commit Message Best Practices

1. **Use Bumper's Tools**

   ```bash
   # Always check your commit message first
   bumper suggest "your message"
   
   # For complex commits, use interactive mode
   bumper commit
   ```

2. **Follow Conventional Commits**
   - Use lowercase for type and scope: `feat(auth): add login`
   - Keep description under 72 characters
   - Use imperative mood: "add" not "added"
   - Don't end with a period

3. **Choose the Right Type**
   - `feat`: New functionality
   - `fix`: Bug fixes
   - `docs`: Documentation changes
   - `style`: Formatting, missing semicolons, etc.
   - `refactor`: Code changes that neither fix bugs nor add features
   - `perf`: Performance improvements
   - `test`: Adding or updating tests
   - `chore`: Maintenance tasks

4. **Use Scopes Wisely**

   ```bash
   # Good - specific scope
   feat(auth): add OAuth2 support
   fix(api): resolve pagination bug
   
   # Avoid - too broad
   feat: add new feature
   fix: fix bug
   ```

5. **Handle Breaking Changes**

   ```bash
   # Breaking change in type
   feat!: change API response format
   
   # Breaking change in body
   feat: change API response format
   
   BREAKING CHANGE: This changes the API response format
   ```

### 🚀 Release Management Best Practices

1. **Start Small**

   ```bash
   # Always preview before releasing
   npm run changelog:preview
   
   # Use dry-run for testing
   npm run release:dry-run
   ```

2. **Choose the Right Version**
   - `patch`: Bug fixes and minor improvements
   - `minor`: New features (backward compatible)
   - `major`: Breaking changes

3. **Keep a Clean History**

   ```bash
   # Validate commits before releasing
   npm run validate:commits
   
   # Fix any issues before proceeding
   git commit --amend -m "feat: correct commit message"
   ```

4. **Automate Everything**
   - Use the provided GitHub Actions workflow
   - Let bumper handle versioning and changelog generation
   - Automate NPM publishing

### 🏗️ Project Setup Best Practices

1. **Install Per-Project**

   ```bash
   # Recommended for teams
   npm install --save-dev bumper-cli
   ```

2. **Run Setup Early**

   ```bash
   # Set up bumper at the start of your project
   bumper setup
   ```

3. **Use NPM Scripts**

   ```bash
   # Use the convenience scripts
   npm run changelog:preview
   npm run release:patch
   ```

4. **Configure Your Team**
   - Share the conventional commits specification
   - Use bumper's commit formatting tools
   - Establish release workflows

### 🔧 Development Workflow

1. **Daily Development**

   ```bash
   # Write your code
   git add .
   
   # Format your commit message
   bumper suggest "add user authentication"
   # or
   bumper commit
   
   # Commit with the suggested message
   git commit -m "feat(auth): add user authentication"
   ```

2. **Before Releasing**

   ```bash
   # Validate all commits
   npm run validate:commits
   
   # Preview the release
   npm run changelog:preview
   
   # Create the release
   npm run release:patch
   ```

3. **After Releasing**
   - Review the generated changelog
   - Check the GitHub release
   - Verify NPM package is published

### 🚨 Common Mistakes to Avoid

1. **Don't Skip Validation**

   ```bash
   # ❌ Don't release without validating
   npm run release:patch
   
   # ✅ Always validate first
   npm run validate:commits
   npm run release:patch
   ```

2. **Don't Ignore Commit Messages**

   ```bash
   # ❌ Poor commit message
   git commit -m "fix stuff"
   
   # ✅ Good commit message
   git commit -m "fix(auth): resolve login timeout issue"
   ```

3. **Don't Skip Previews**

   ```bash
   # ❌ Don't release blind
   npm run release:patch
   
   # ✅ Always preview first
   npm run changelog:preview
   npm run release:patch
   ```

## 🔧 Configuration

### Commitlint Configuration

The setup creates a `commitlint.config.js` file:

```javascript
module.exports = {
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
        'security',
      ],
    ],
    'type-case': [2, 'always', 'lowerCase'],
    'type-empty': [2, 'never'],
    'subject-case': [2, 'always', 'lowerCase'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 72],
  },
};
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
  formatCommitMessage,
  suggestCommitFormat,
} from 'bumper-cli';

// Generate changelog
await generateChangelog({ preview: true });

// Validate commits
const result = await validateCommits();

// Create release
const release = await createRelease({
  type: 'patch',
  dryRun: true,
});

// Format commit message
const formatted = formatCommitMessage('add login feature', 'feat', 'auth');

// Suggest commit format
const suggestion = suggestCommitFormat('fix login bug');
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

interface CommitSuggestion {
  original: string;
  suggested: string;
  type: string;
  scope?: string;
  breaking: boolean;
  improvements: string[];
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
