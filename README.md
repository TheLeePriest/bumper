# 🚀 Bumper

> 🚀 A magical release management system with beautiful changelogs and automated workflows

[![npm version](https://img.shields.io/npm/v/bumper-cli.svg?style=flat-square)](https://www.npmjs.com/package/bumper-cli)
[![npm downloads](https://img.shields.io/npm/dm/bumper-cli.svg?style=flat-square)](https://www.npmjs.com/package/bumper-cli)
[![GitHub stars](https://img.shields.io/github/stars/TheLeePriest/bumper?style=flat-square)](https://github.com/TheLeePriest/bumper/stargazers)
[![CI](https://github.com/TheLeePriest/bumper/actions/workflows/release.yml/badge.svg)](https://github.com/TheLeePriest/bumper/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Bumper is a modern, developer-friendly tool that automates your entire release process. From conventional commit validation to beautiful changelog generation, automated version bumping, and seamless GitHub releases - it handles everything with style.

## ✨ Features

- 🎯 **Zero Configuration** - Works out of the box with sensible defaults
- 📝 **Beautiful Changelogs** - Auto-generated with emojis and smart categorization
- 🔍 **Commit Validation** - Enforces conventional commit standards
- ✨ **Commit Formatting** - Interactive commit creation and suggestions
- 🚀 **Automated Releases** - One command to rule them all
- 🎨 **Beautiful UX** - Colorful output with spinners and progress indicators
- 🔧 **GitHub Integration** - Automatic releases and workflow setup
- 🐕 **Git Hooks** - Pre-commit validation with Husky
- 📦 **NPM Publishing** - Seamless package publishing
- 🎪 **Platform Agnostic** - Works with any Git-based project

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
    "commit:create": "bumper commit"
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
