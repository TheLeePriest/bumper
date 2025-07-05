# 🏖️ Line in the Sand: Non-Invasive Migration Guide

This guide shows how to adopt conventional commits without rewriting git history - the safest approach for most projects.

## 🎯 What is "Line in the Sand"?

The "Line in the Sand" approach means:
- **Draw a line** at a specific point in your git history
- **Keep everything before** that line unchanged (legacy commits)
- **Use conventional commits** for everything after that line
- **No git history rewriting** - completely safe and non-invasive

## 🚀 Quick Start

### Step 1: Draw the Line

```bash
# Install bumper
npm install --save-dev bumper-cli

# Draw a line in the sand from now on
npx bumper line-in-sand
```

That's it! You're now using conventional commits.

### Step 2: Start Using Conventional Commits

```bash
# Interactive commit creation
npx bumper commit

# Get suggestions for your message
npx bumper suggest "add user authentication"

# Validate your commits
npx bumper validate
```

## 📅 Different Starting Points

### Start from Now (Most Common)

```bash
bumper line-in-sand
```

**Use when:** You want to start using conventional commits immediately.

### Start from a Specific Date

```bash
bumper line-in-sand --start-date 2024-01-01
```

**Use when:** You want to include commits from a specific date forward.

### Start from a Specific Commit

```bash
bumper line-in-sand --start-commit abc12345
```

**Use when:** You want to start from a specific commit hash.

### Start from a Tag

```bash
bumper line-in-sand --tag v1.0.0
```

**Use when:** You want to start from a specific release tag.

## 📊 What Happens

### Before Line in the Sand
```
commit abc12345 (legacy)
Author: John Doe
Date: 2024-01-01

add new feature

commit def67890 (legacy)
Author: Jane Smith
Date: 2024-01-02

fix bug in auth
```

### After Line in the Sand
```
commit ghi11111 (conventional)
Author: John Doe
Date: 2024-01-03

feat: Add user dashboard

commit jkl22222 (conventional)
Author: Jane Smith
Date: 2024-01-04

fix: Resolve login validation issue
```

## 🔧 What Gets Set Up

When you run `bumper line-in-sand`, it creates:

### 1. Infrastructure Files
- `commitlint.config.js` - Conventional commit validation rules
- `.husky/commit-msg` - Git hook for commit validation
- `package.json` scripts - Convenient npm commands

### 2. Marker Files
- `.conventional-commits-start` - Documentation of the start point
- Git tag `conventional-commits-start-YYYY-MM-DD` - Marks the line in the sand

### 3. NPM Scripts
```json
{
  "scripts": {
    "validate:commits": "bumper validate",
    "changelog:preview": "bumper preview",
    "release:patch": "bumper release patch",
    "release:minor": "bumper release minor",
    "release:major": "bumper release major"
  }
}
```

## 📝 Example Workflow

### Day 1: Draw the Line

```bash
# In your project directory
npm install --save-dev bumper-cli
npx bumper line-in-sand

# Output:
# 🏖️ Drawing a Line in the Sand
# ==================================================
# 
# 📊 Setting up conventional commits from: current commit
# 
# 📈 Commit Analysis:
#    Total commits from start point: 1
#    Conventional commits: 0
#    Legacy commits: 1
# 
# 💡 Note: 1 legacy commits will remain unchanged
#    Only new commits from this point forward will use conventional format
# 
# ✅ Line in the sand drawn successfully!
```

### Day 2: Make Your First Conventional Commit

```bash
# Interactive commit
npx bumper commit

# Or get suggestions
npx bumper suggest "add login form"
# Output: feat: Add login form

# Commit with the suggested message
git add .
git commit -m "feat: Add login form"
```

### Day 3: Preview Your Changelog

```bash
npx bumper preview

# Output:
# 📝 Changelog Preview
# ==================================================
# 
# ## [1.1.0] - 2024-01-03 (MINOR RELEASE)
# 
# ### ✨ Features
# - Add login form (ghi11111)
# 
# ### 🔧 Other Changes
# - add new feature (abc12345)  # Legacy commit
# - fix bug in auth (def67890)  # Legacy commit
```

## 🎯 Benefits of This Approach

### ✅ Safety
- **No git history rewriting** - completely safe
- **No risk of losing commits** - everything is preserved
- **No team coordination needed** - can be done independently

### ✅ Simplicity
- **One command setup** - `bumper line-in-sand`
- **Immediate results** - start using conventional commits right away
- **No complex migration** - just draw a line and move forward

### ✅ Team Friendly
- **No disruption** - existing workflows continue unchanged
- **Gradual adoption** - team can learn at their own pace
- **No force push** - no coordination with other developers needed

### ✅ Flexibility
- **Mixed commit formats** - changelog handles both legacy and conventional
- **Gradual migration** - can still migrate legacy commits later if desired
- **Configurable** - can customize validation rules and mappings

## 🔍 How Changelog Generation Works

With mixed commit formats, bumper intelligently handles both:

### Legacy Commits
- Categorized as `chore` by default
- Type inferred from commit message content
- Included in changelog but marked as legacy

### Conventional Commits
- Properly categorized by type
- Full conventional commit features
- Breaking changes detected

### Example Changelog
```markdown
## [1.2.0] - 2024-01-05 (MINOR RELEASE)

### ✨ Features
- Add user dashboard (jkl22222)
- Add login form (ghi11111)

### 🐛 Bug Fixes
- Fix authentication issue (mno33333)

### 🔧 Other Changes
- add new feature (abc12345)  # Legacy
- fix bug in auth (def67890)  # Legacy
```

## 🚀 Advanced Usage

### Custom Configuration

Create `bumper.config.json` to customize behavior:

```json
{
  "legacySupport": {
    "enabled": true,
    "validationMode": "warn",
    "fallbackType": "chore",
    "includeLegacyInChangelog": true,
    "customMappings": {
      "implement": "feat",
      "resolve": "fix",
      "enhance": "feat"
    }
  }
}
```

### Team Training

Help your team adopt conventional commits:

```bash
# Show commit suggestions
npx bumper suggest "update dependencies"
# Output: chore: Update dependencies

# Interactive commit creation
npx bumper commit
# Guides through type, scope, and message

# Validate commits
npx bumper validate
# Shows validation results
```

### Gradual Legacy Migration

If you later want to migrate legacy commits:

```bash
# Analyze legacy commits
npx bumper analyze-legacy

# Migrate recent commits in small batches
npx bumper bulk-format --range HEAD~10..HEAD --dry-run
npx bumper bulk-format --range HEAD~10..HEAD
```

## ⚠️ Important Notes

### Git History
- **Legacy commits remain unchanged** - they keep their original messages
- **No history rewriting** - commit hashes stay the same
- **Safe for collaboration** - no force push required

### Validation
- **Only new commits are validated** - legacy commits are ignored
- **Warnings for legacy commits** - you'll see warnings but no errors
- **Configurable strictness** - can adjust validation rules

### Changelog
- **Mixed format support** - handles both legacy and conventional commits
- **Legacy categorization** - legacy commits are categorized intelligently
- **Full feature support** - breaking changes, scopes, etc. work normally

## 🎉 Success!

Once you've drawn your line in the sand:

- ✅ **Conventional commits** are now enforced for new commits
- ✅ **Beautiful changelogs** are generated automatically
- ✅ **Semantic versioning** works with your release process
- ✅ **Team collaboration** is improved with consistent commit messages
- ✅ **Project maintainability** is enhanced

Your project is now ready for modern release management without any risk! 🚀 