# 🔄 Legacy Project Migration Guide

This guide shows how to migrate an existing project that doesn't follow conventional commit format to use bumper effectively.

## 📋 Prerequisites

- Git repository with commit history
- Node.js and npm installed
- Backup of your repository (especially for bulk formatting)

## 🎯 Migration Workflow

### Step 0: Choose Your Approach

**🏖️ Line in the Sand (Recommended)**
```bash
# Non-invasive: Start fresh from now on
bumper line-in-sand
```
- ✅ No git history rewriting
- ✅ No team coordination needed
- ✅ Immediate setup
- ✅ Safe for any project size

**🔧 Full Migration (Advanced)**
- Requires git history rewriting
- Needs team coordination
- More complex setup
- Best for small projects or solo developers

### Step 1: Analyze Your Current State

First, understand your current commit patterns:

```bash
# Install bumper
npm install --save-dev bumper-cli

# Analyze all commits
npx bumper analyze-legacy

# Analyze recent commits only
npx bumper analyze-legacy --range HEAD~50..HEAD

# Save analysis to file for review
npx bumper analyze-legacy --output migration-analysis.json
```

**Example Output:**
```
📊 Legacy Commit Analysis
==================================================

📈 Commit Statistics:
   Total commits: 150
   Conventional commits: 5
   Legacy commits: 145
   Migration rate: 3.3%

🎯 Migration Strategy: GRADUAL

📋 Top Commit Patterns:
   1. "add" (45 commits) → feat
      Example: add new feature
      Example: add user authentication
   2. "fix" (32 commits) → fix
      Example: fix login bug
      Example: fix broken link
   3. "update" (28 commits) → chore
      Example: update dependencies
      Example: update readme

💡 Recommendations:
   1. Large number of legacy commits detected. Consider gradual migration starting from recent commits.
   2. High-frequency patterns detected. Create custom mapping rules for these patterns.
```

### Step 2: Choose Migration Strategy

Based on the analysis, choose your approach:

#### Option A: Gradual Migration (Recommended for large projects)

```bash
# 1. Set up conventional commit infrastructure
npx bumper migrate-legacy

# 2. Start using conventional commits for new work
npx bumper commit  # Interactive commit creation
npx bumper suggest "add login feature"  # Get suggestions

# 3. Format recent commits in small batches
npx bumper bulk-format --range HEAD~10..HEAD --dry-run  # Preview
npx bumper bulk-format --range HEAD~10..HEAD  # Apply

# 4. Repeat for older commits
npx bumper bulk-format --range HEAD~20..HEAD~10 --dry-run
```

#### Option B: Bulk Migration (For smaller projects)

```bash
# 1. Set up infrastructure
npx bumper migrate-legacy

# 2. Preview all changes
npx bumper bulk-format --dry-run

# 3. Apply all changes (⚠️ rewrites history)
npx bumper bulk-format
```

### Step 3: Verify Migration

After migration, verify everything works:

```bash
# Check commit validation
npx bumper validate

# Preview changelog
npx bumper preview

# Test release process
npx bumper release patch --dry-run
```

## 🔧 Custom Configuration

Create a `bumper.config.json` file to customize the migration:

```json
{
  "legacySupport": {
    "enabled": true,
    "migrationStrategy": "gradual",
    "customMappings": {
      "implement": "feat",
      "resolve": "fix",
      "patch": "fix",
      "enhance": "feat",
      "optimize": "perf",
      "cleanup": "refactor"
    },
    "validationMode": "warn",
    "fallbackType": "chore",
    "includeLegacyInChangelog": true,
    "legacyCommitThreshold": 50
  }
}
```

## 📝 Common Migration Patterns

### Pattern 1: "Add" Commits
```
Before: add new feature
After:  feat: Add new feature
```

### Pattern 2: "Fix" Commits
```
Before: fix login bug
After:  fix: Fix login bug
```

### Pattern 3: "Update" Commits
```
Before: update dependencies
After:  chore: Update dependencies
```

### Pattern 4: "Refactor" Commits
```
Before: refactor auth module
After:  refactor: Refactor auth module
```

## ⚠️ Important Warnings

### Git History Rewriting
- **Always backup** your repository before bulk formatting
- **Inform your team** about history changes
- **Coordinate** with other developers to avoid conflicts
- **Use `--force-with-lease`** when pushing rewritten history

### Team Coordination
- **Communicate** the migration plan to your team
- **Schedule** the migration during low-activity periods
- **Provide training** on conventional commits
- **Update CI/CD** pipelines if needed

## 🚀 Post-Migration

After successful migration:

1. **Update documentation** to reflect new commit standards
2. **Train team members** on conventional commits
3. **Set up CI/CD** to enforce commit standards
4. **Monitor** commit quality with regular validation

## 🔍 Troubleshooting

### Common Issues

**Issue**: "No legacy commits found"
**Solution**: Your project is already using conventional commits!

**Issue**: "Failed to install dependencies"
**Solution**: Check your npm configuration and try manually installing `@commitlint/cli` and `husky`

**Issue**: "Git history rewrite failed"
**Solution**: 
- Ensure you have a clean working directory
- Check for uncommitted changes
- Verify you have proper permissions

**Issue**: "Validation still failing after migration"
**Solution**:
- Check your `commitlint.config.js` configuration
- Verify husky hooks are properly installed
- Test with a simple conventional commit

### Getting Help

- Run `npx bumper analyze-legacy` to get detailed analysis
- Check the generated `migration-analysis.json` file
- Review the bumper documentation
- Open an issue on the bumper GitHub repository

## 📊 Success Metrics

Track your migration progress:

```bash
# Before migration
npx bumper analyze-legacy --output before.json

# After migration
npx bumper analyze-legacy --output after.json

# Compare results
diff before.json after.json
```

**Target metrics:**
- ✅ 100% conventional commits
- ✅ 0 validation errors
- ✅ Successful changelog generation
- ✅ Automated releases working

## 🎉 Migration Complete!

Once migration is complete, you can:

- Generate beautiful changelogs automatically
- Create releases with semantic versioning
- Use automated GitHub workflows
- Enjoy better project maintainability

Your project is now ready for modern release management! 🚀 