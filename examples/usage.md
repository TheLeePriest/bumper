# Bumper Usage Guide

Bumper is a magical release management system for Node.js projects. Here's how to use it in your workflow.

---

## 🚀 Installation & Usage - Choose Your Method

### Method 1: Per-Project Installation (Recommended for teams)

```bash
# Install in your project
npm install --save-dev bumper-cli

# Use with npm run (recommended)
npm run validate:commits
npm run changelog:preview
npm run release:patch

# Or use with npx (alternative)
npx bumper-cli preview
npx bumper-cli validate
npx bumper-cli release patch
```

**✅ Works:** In the project where it's installed  
**✅ Benefits:** Version control, team consistency, isolation, no npx needed

---

### Method 2: Global Installation (CLI everywhere)

```bash
# Install globally
npm install -g bumper-cli

# Use from ANY directory
bumper preview
bumper validate
bumper release patch
```

**✅ Works:** Anywhere on your system  
**❌ Limitation:** Global installation, potential version conflicts

---

### Method 3: In the Bumper Project Itself (Development only)

```bash
# Only works in the bumper project directory
cd /path/to/bumper
npm run bumper -- preview
npm run bumper -- validate
npm run bumper -- release patch
```

**✅ Works:** Only in the bumper project directory  
**❌ Limitation:** Only for bumper development

---

## 🎯 Quick Reference - What Works Where

| Installation Method | Command | Works In | Example |
|-------------------|---------|----------|---------|
| **Per-Project** | `npm run <script>` | Project directory | `npm run validate:commits` |
| **Per-Project** | `npx bumper-cli <command>` | Project directory | `npx bumper-cli preview` |
| **Global** | `bumper <command>` | Any directory | `bumper preview` |
| **Bumper Dev** | `npm run bumper -- <command>` | Bumper project only | `npm run bumper -- preview` |

---

## ❌ Common Mistakes - What Won't Work

```bash
# ❌ This will fail in any project except bumper itself
npm run bumper preview

# ❌ This will fail if bumper isn't installed globally
bumper preview

# ❌ This will fail if you're not in the right directory
cd /wrong/directory
npx bumper preview

# ❌ This will fail if setup wasn't run
npm run changelog:preview
```

---

## ✅ What Always Works

```bash
# ✅ Global installation - works anywhere
npm install -g bumper-cli
bumper preview

# ✅ Per-project installation - works in that project
npm install --save-dev bumper-cli
npx bumper preview

# ✅ In bumper project only
cd /path/to/bumper
npm run bumper -- preview
```

---

## 🏃 Detailed Usage Examples

### Per-Project Installation Workflow (Recommended)

```bash
# 1. Navigate to your project
cd /your/project

# 2. Install bumper
npm install --save-dev bumper-cli

# 3. Use npm run scripts (recommended)
npm run validate:commits
npm run changelog:preview
npm run changelog:generate
npm run release:patch
npm run release:minor
npm run release:major
npm run release:dry-run

# 4. Or use npx (alternative)
npx bumper-cli preview
npx bumper-cli validate
npx bumper-cli generate
npx bumper-cli release patch
```

### Global Installation Workflow

```bash
# 1. Install globally
npm install -g bumper-cli

# 2. Use from any directory
cd /any/project
bumper preview
bumper validate
bumper generate
bumper release patch
```

### Bumper Development Workflow

```bash
# 1. Navigate to bumper project
cd /path/to/bumper

# 2. Use the bumper script (only works here)
npm run bumper -- preview
npm run bumper -- validate
npm run bumper -- release patch
```

---

## 📝 Command Reference

### Preview & Validation

```bash
# Preview your next release
npm run changelog:preview
# or: npx bumper-cli preview

# Validate commit messages
npm run validate:commits
# or: npx bumper-cli validate

# Generate changelog
npm run changelog:generate
# or: npx bumper-cli generate
```

### Release Management

```bash
# Create releases
npm run release:patch
npm run release:minor
npm run release:major

# Dry run (preview without making changes)
npm run release:dry-run
```

### Setup

```bash
# Setup project (adds convenience scripts)
npx bumper-cli setup
```

### Convenience Scripts (After Setup)

```bash
# Preview changelog
npm run changelog:preview

# Generate changelog
npm run changelog:generate

# Validate commits
npm run validate:commits

# Create releases
npm run release:patch
npm run release:minor
npm run release:major

# Dry run
npm run release:dry-run
```

### Release Commands

```bash
# Create a patch release (1.0.0 → 1.0.1)
npm run release:patch
# or: npx bumper-cli release patch

# Create a minor release (1.0.0 → 1.1.0)
npm run release:minor
# or: npx bumper-cli release minor

# Create a major release (1.0.0 → 2.0.0)
npm run release:major
# or: npx bumper-cli release major

# Dry run (preview without making changes)
npm run release:dry-run
# or: npx bumper-cli release patch --dry-run
```

### Dry Run Example

```bash
npm run release:dry-run
# or: npx bumper-cli release patch --dry-run
```

---

## 🔧 Troubleshooting

### "Command not found" or "Missing script"

**Problem:** You're trying to use a command that doesn't exist in your current setup.

**Solutions:**
```bash
# If you want to use bumper from anywhere:
npm install -g bumper-cli
bumper preview

# If you want to use bumper in a specific project:
npm install --save-dev bumper-cli
npx bumper preview

# If you're in the bumper project:
npm run bumper -- preview
```

### "npm run bumper preview" doesn't work

**Problem:** The `npm run bumper` script only exists in the bumper project itself.

**Solution:** Use `npx bumper preview` instead, or install globally and use `bumper preview`.

### "npx bumper preview" doesn't work

**Problem:** Bumper isn't installed in the current project.

**Solution:** Install it first:
```bash
npm install --save-dev bumper-cli
npx bumper preview
```

---

## 🎯 Installation Methods Comparison

| Method | Install | Usage | Works In | Best For |
|--------|---------|-------|----------|----------|
| **Per-Project** | `npm install --save-dev bumper-cli` | `npm run <script>` | Project directory only | **Teams, production projects** |
| **Per-Project** | `npm install --save-dev bumper-cli` | `npx bumper-cli <command>` | Project directory only | Teams, production projects |
| **Global** | `npm install -g bumper-cli` | `bumper <command>` | Any directory | CLI tools, personal use |
| **Bumper Dev** | (in bumper project) | `npm run bumper -- <command>` | Bumper project only | Bumper development |

**Key Point:** The `npm run bumper` command only exists in the bumper project itself. Other projects use `npm run <script>` or `npx bumper-cli`.

---

## 🎯 Conventional Commits

Bumper enforces the [Conventional Commits](https://conventionalcommits.org/) specification for consistent commit messages and automatic changelog generation.

### Commit Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Supported Types

| Type       | Emoji | Description              | Version Impact |
| ---------- | ----- | ------------------------ | -------------- |
| `feat`     | ✨    | New features             | Minor          |
| `fix`      | 🐛    | Bug fixes                | Patch          |
| `docs`     | 📚    | Documentation            | None           |
| `style`    | 💄    | Code style changes       | None           |
| `refactor` | ♻️    | Code refactoring         | None           |
| `perf`     | ⚡    | Performance improvements | Patch          |
| `test`     | ✅    | Adding tests             | None           |
| `build`    | 📦    | Build system changes     | None           |
| `ci`       | 🔧    | CI/CD changes            | None           |
| `chore`    | 🔨    | Maintenance tasks        | None           |
| `revert`   | ⏪    | Reverting changes        | None           |
| `security` | 🔒    | Security fixes           | Patch          |

### Examples

```bash
# Feature (triggers minor version bump)
git commit -m "feat: add user authentication system"

# Bug fix (triggers patch version bump)
git commit -m "fix: resolve login timeout issue"

# Breaking change (triggers major version bump)
git commit -m "feat!: change API response format"

# With scope
git commit -m "feat(auth): add OAuth2 support"

# With body
git commit -m "feat: add dark mode

This adds a new dark mode toggle that can be enabled
by users in their preferences."

# Revert
git commit -m "revert: feat: add dark mode"
```

### Breaking Changes

Use `!` after the type/scope to indicate breaking changes:

```bash
git commit -m "feat!: change API response format"
git commit -m "feat(auth)!: remove deprecated login method"
```

---

## 🔍 Commit Validation

Bumper validates your commits to ensure they follow the conventional format.

### Validation Rules

- ✅ **Format**: Must follow `<type>(scope): description` pattern
- ✅ **Type**: Must be one of the supported types
- ✅ **Length**: Subject line should be under 72 characters
- ✅ **Case**: Type and subject should be lowercase
- ✅ **Punctuation**: Subject should not end with a period

### Validation Commands

```bash
# Validate all commits since last tag
npm run bumper -- validate

# Validate specific commit
npx commitlint --edit .git/COMMIT_EDITMSG
```

### Example Validation Output

```
🔍 Validating commit messages...
📝 Validating 3 commits...

✅ a1b2c3d4: feat: add user authentication
✅ e5f6g7h8: fix: resolve login timeout issue
❌ i9j0k1l2: invalid commit message
   - Commit message does not follow conventional commit format

📊 Validation Summary:
Total commits: 3
Valid commits: 2
Invalid commits: 1
Total errors: 1
Total warnings: 0

❌ Validation failed! Please fix the errors above.
```

### Git Hooks

The setup automatically installs Husky hooks that validate commits:

- **commit-msg**: Validates commit message format
- **pre-push**: Runs tests before pushing

---

## 📋 Changelog Generation

Bumper automatically generates beautiful, categorized changelogs from your conventional commits.

### Features

- 🎨 **Emoji Categories**: Each commit type gets its own emoji
- ⚠️ **Breaking Changes**: Highlighted prominently at the top
- 👥 **Contributors**: Credits all contributors to the release
- 📊 **Smart Categorization**: Groups commits by type and scope
- 🏷️ **Commit References**: Links to commit hashes
- 📅 **Release Dates**: Automatically dated releases

### Example Changelog

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

### 📚 Documentation

- **readme:** update installation instructions (u1v2w3x4)

### 🔧 Chores

- **deps:** update dependencies to latest versions (y5z6a7b8)

### 👥 Contributors

Thanks to John Doe, Jane Smith for contributing to this release!
```

### Changelog Commands

```bash
# Preview next release changelog
npm run bumper -- preview

# Generate and save changelog
npm run bumper -- generate
```

---

## 🚀 Release Management

Bumper automates the entire release process with semantic versioning.

### Release Types

| Type  | Description                    | Example: 1.0.0 → |
|-------|--------------------------------|------------------|
| `patch` | Bug fixes, minor changes      | 1.0.1           |
| `minor` | New features, non-breaking    | 1.1.0           |
| `major` | Breaking changes              | 2.0.0           |

### Automatic Version Detection

Bumper automatically determines the release type based on your commits:

- **Major**: Any commit with `!` (breaking change)
- **Minor**: Any `feat` commit (new features)
- **Patch**: Any `fix`, `perf`, or `security` commit

### Release Process

When you run a release, Bumper:

1. **Validates**: Checks all commits follow conventional format
2. **Analyzes**: Determines release type from commits
3. **Generates**: Creates beautiful changelog
4. **Updates**: Bumps version in package.json
5. **Commits**: Creates release commit
6. **Tags**: Creates git tag
7. **Pushes**: Pushes changes and tag
8. **Publishes**: Publishes to npm
9. **Releases**: Creates GitHub release

### Release Commands

```bash
# Create a patch release (1.0.0 → 1.0.1)
npm run release:patch
# or: npx bumper-cli release patch

# Create a minor release (1.0.0 → 1.1.0)
npm run release:minor
# or: npx bumper-cli release minor

# Create a major release (1.0.0 → 2.0.0)
npm run release:major
# or: npx bumper-cli release major

# Dry run (preview without making changes)
npm run release:dry-run
# or: npx bumper-cli release patch --dry-run
```

### Dry Run Example

```bash
npm run release:dry-run
# or: npx bumper-cli release patch --dry-run
```

Output:

```
🚀 Starting DRY RUN release process...
📦 Version: 1.0.0 → 1.0.1
🎯 Release Type: PATCH

📋 DRY RUN - What would happen:
==================================================
1. Update package.json version to 1.0.1
2. Commit changes with message: "chore: release v1.0.1"
3. Create git tag: v1.0.1
4. Push changes and tag to remote
5. Publish to npm
6. Create GitHub release
==================================================

📝 Release notes preview:
## [1.0.1] - 2024-01-15 (PATCH RELEASE)

### 🐛 Bug Fixes
- fix login timeout issue (a1b2c3d4)
```

---

## 🔧 Configuration

### Commitlint Configuration

The setup creates `commitlint.config.json`:

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

Automatically creates `.github/workflows/release.yml` for automated releases triggered by git tags.

---

## 💡 Best Practices

### Commit Messages

- **Use conventional format**: `type(scope): description`
- **Keep it concise**: Subject under 72 characters
- **Be descriptive**: Clear, meaningful descriptions
- **Use scopes**: Group related changes (e.g., `feat(auth)`)
- **Mark breaking changes**: Use `!` for breaking changes

### Release Workflow

- **Preview first**: Always run `bumper preview` or `npx bumper preview`
- **Use dry runs**: Test with `--dry-run` before actual release
- **Validate commits**: Run validation before releasing
- **Review changelog**: Check generated changelog looks correct

### Team Workflow

- **Use per-project installation**: For version control and consistency
- **Set up git hooks**: Automatic validation on every commit
- **Document process**: Share setup instructions with team
- **Use CI/CD**: Automated releases via GitHub Actions

---

## 🛠️ Troubleshooting

### Common Issues

**Command not found?**

- Make sure Bumper is installed locally or globally
- Use `npx bumper <subcommand>` for per-project installation
- Use `bumper <subcommand>` for global installation

**Script not found?**

- Run `npx bumper setup` to add convenience scripts

**Permission denied?**

- Use `npx bumper <subcommand>` instead of direct execution

**Commit validation fails?**

```bash
# Check commit format
npm run bumper -- validate
# or: npx bumper-cli validate

# Fix recent commit
git commit --amend -m "feat: add new feature"
```

**Release fails?**

```bash
# Check git status
git status

# Ensure you're on main branch
git checkout main

# Try dry run first
npm run release:dry-run
# or: npx bumper-cli release patch --dry-run
```

**GitHub release fails?**

- Ensure `GITHUB_TOKEN` secret is set in repository
- Check that GitHub CLI is available in workflow
- Verify repository permissions

---

## 🏁 Summary Table

| Install Method   | Command Example                  | Works In | Best For |
|-----------------|----------------------------------|----------|----------|
| Global          | `bumper preview`                 | Any directory | CLI tools, personal use |
| Per-Project     | `npx bumper preview`             | Project directory | Teams, production projects |
| Per-Project     | `npm run changelog:preview`      | Project directory (after setup) | Teams, production projects |
| Bumper Dev      | `npm run bumper -- preview`      | Bumper project only | Bumper development |

---

## 📚 Additional Resources

- [Conventional Commits](https://conventionalcommits.org/) - Commit specification
- [Semantic Versioning](https://semver.org/) - Version numbering
- [Keep a Changelog](https://keepachangelog.com/) - Changelog format
- [Husky](https://typicode.github.io/husky/) - Git hooks
- [Commitlint](https://commitlint.js.org/) - Commit validation

For more, see the main [README](../README.md).
