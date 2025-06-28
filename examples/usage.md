# Bumper Usage Guide

Bumper is a magical release management system for Node.js projects. Here's how to use it in your workflow.

---

## 🚀 Installation

### Option 1: Global (for CLI everywhere)

```bash
npm install -g bumper-cli
```

### Option 2: Per-Project (Recommended)

```bash
npm install --save-dev bumper-cli
```

---

## ⚡ Setup

### Global

```bash
bumper setup
```

### Per-Project

```bash
npx bumper setup
# or, after setup:
npm run bumper setup
```

---

## 🏃 Usage (Per-Project, Recommended)

When you install Bumper locally, `npm run bumper` is automatically available thanks to the `bin` field in the package.json.

Now you can run any Bumper command like this:

```bash
npm run bumper <subcommand> [options]
```

### Common Examples

#### Preview Next Release

```bash
npm run bumper preview
```

#### Validate Commits

```bash
npm run bumper validate
```

#### Generate Changelog

```bash
npm run bumper generate
```

#### Create a Release

```bash
npm run bumper release patch
npm run bumper release minor
npm run bumper release major
npm run bumper release patch --dry-run
```

#### Setup (if not already set up)

```bash
npm run bumper setup
```

**Note**: The setup also adds convenience scripts like `npm run changelog:preview` and `npm run release:patch` for common tasks.

---

## 📝 Global Usage (Alternative)

If installed globally, you can use:

```bash
bumper preview
bumper validate
bumper release patch
```

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
npm run bumper validate

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
npm run bumper preview

# Generate and save changelog
npm run bumper generate
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
npm run bumper release patch

# Create a minor release (1.0.0 → 1.1.0)
npm run bumper release minor

# Create a major release (1.0.0 → 2.0.0)
npm run bumper release major

# Dry run (preview without making changes)
npm run bumper release patch --dry-run
```

### Dry Run Example

```bash
npm run bumper release patch --dry-run
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

- **Preview first**: Always run `npm run bumper preview`
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
- Use `npm run bumper <subcommand>` for per-project

**Script not found?**

- Run `npx bumper setup` to add scripts

**Permission denied?**

- Use `npm run bumper ...` instead of direct execution

**Commit validation fails?**

```bash
# Check commit format
npm run bumper validate

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
npm run bumper release patch --dry-run
```

**GitHub release fails?**

- Ensure `GITHUB_TOKEN` secret is set in repository
- Check that GitHub CLI is available in workflow
- Verify repository permissions

---

## 🏁 Summary Table

| Install Method   | Command Example                  | Notes                       |
|-----------------|----------------------------------|-----------------------------|
| Global          | `bumper preview`                 | CLI everywhere              |
| Per-Project     | `npm run bumper preview`         | Recommended for teams/CI    |
| Per-Project     | `npx bumper preview`             | Works, but `npm run` better |

---

## 📚 Additional Resources

- [Conventional Commits](https://conventionalcommits.org/) - Commit specification
- [Semantic Versioning](https://semver.org/) - Version numbering
- [Keep a Changelog](https://keepachangelog.com/) - Changelog format
- [Husky](https://typicode.github.io/husky/) - Git hooks
- [Commitlint](https://commitlint.js.org/) - Commit validation

For more, see the main [README](../README.md).
