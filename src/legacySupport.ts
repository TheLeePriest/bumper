#!/usr/bin/env node

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import inquirer from 'inquirer';

interface LegacyCommit {
  hash: string;
  message: string;
  author: string;
  date: string;
  type?: string;
  scope?: string;
  subject?: string;
}

interface CommitPattern {
  pattern: string;
  count: number;
  examples: string[];
  suggestedType: string;
  suggestedScope?: string;
}

interface MigrationAnalysis {
  totalCommits: number;
  conventionalCommits: number;
  legacyCommits: number;
  patterns: CommitPattern[];
  recommendations: string[];
  migrationStrategy: 'gradual' | 'bulk' | 'hybrid';
}

interface BulkFormatOptions {
  range?: string;
  dryRun?: boolean;
  interactive?: boolean;
}

interface LineInSandOptions {
  startDate?: string;
  startCommit?: string;
  tag?: string;
  force?: boolean;
}

// Get commits from git log with full information
const getCommitsWithDetails = (range?: string): LegacyCommit[] => {
  const command = range
    ? `git log --pretty=format:"%H|%s|%an|%ad" --date=short ${range}`
    : 'git log --pretty=format:"%H|%s|%an|%ad" --date=short';
    
  const commits = execSync(command, { encoding: 'utf8' }).trim();
  
  if (!commits) return [];
  
  return commits.split('\n').map((line) => {
    const parts = line.split('|');
    return {
      hash: parts[0]?.substring(0, 8) || '',
      message: parts[1] || '',
      author: parts[2] || '',
      date: parts[3] || '',
    };
  });
};

// Check if commit follows conventional format
const isConventionalCommit = (message: string): boolean => {
  const conventionalRegex = /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert|security)(\([\w-]+\))?(!)?:\s(.+)$/;
  return conventionalRegex.test(message);
};

// Analyze commit patterns
const analyzeCommitPatterns = (commits: LegacyCommit[]): CommitPattern[] => {
  const patterns = new Map<string, CommitPattern>();
  
  for (const commit of commits) {
    if (isConventionalCommit(commit.message)) continue;
    
    // Extract common patterns
    const words = commit.message.toLowerCase().split(/\s+/);
    const firstWord = words[0];
    
    if (!firstWord) continue;
    
    if (!patterns.has(firstWord)) {
      patterns.set(firstWord, {
        pattern: firstWord,
        count: 0,
        examples: [],
        suggestedType: 'chore',
      });
    }
    
    const pattern = patterns.get(firstWord);
    if (!pattern) continue;
    pattern.count++;
    if (pattern.examples.length < 3) {
      pattern.examples.push(commit.message);
    }
    
    // Suggest type based on first word
    if (['add', 'new', 'create', 'implement'].includes(firstWord)) {
      pattern.suggestedType = 'feat';
    } else if (['fix', 'bug', 'issue', 'problem'].includes(firstWord)) {
      pattern.suggestedType = 'fix';
    } else if (['update', 'upgrade', 'bump'].includes(firstWord)) {
      pattern.suggestedType = 'chore';
    } else if (['refactor', 'clean', 'improve'].includes(firstWord)) {
      pattern.suggestedType = 'refactor';
    } else if (['test', 'spec'].includes(firstWord)) {
      pattern.suggestedType = 'test';
    } else if (['doc', 'readme', 'comment'].includes(firstWord)) {
      pattern.suggestedType = 'docs';
    }
  }
  
  return Array.from(patterns.values()).sort((a, b) => b.count - a.count);
};

// Generate migration recommendations
const generateRecommendations = (analysis: MigrationAnalysis): string[] => {
  const recommendations: string[] = [];
  
  if (analysis.legacyCommits > 100) {
    recommendations.push('Large number of legacy commits detected. Consider gradual migration starting from recent commits.');
  }
  
  if (analysis.patterns.length > 10) {
    recommendations.push('Many different commit patterns found. Use bulk formatting with custom rules.');
  }
  
  if (analysis.conventionalCommits > 0) {
    recommendations.push('Some conventional commits already exist. Use hybrid migration strategy.');
  }
  
  if (analysis.patterns.some(p => p.count > 20)) {
    recommendations.push('High-frequency patterns detected. Create custom mapping rules for these patterns.');
  }
  
  return recommendations;
};

// Determine migration strategy
const determineMigrationStrategy = (analysis: MigrationAnalysis): 'gradual' | 'bulk' | 'hybrid' => {
  if (analysis.legacyCommits < 50) return 'bulk';
  if (analysis.conventionalCommits > analysis.legacyCommits * 0.3) return 'hybrid';
  return 'gradual';
};

// Analyze legacy commits
export const analyzeLegacyCommits = async (options: { range?: string; output?: string }): Promise<void> => {
  const commits = getCommitsWithDetails(options.range);
  const conventionalCommits = commits.filter(c => isConventionalCommit(c.message));
  const legacyCommits = commits.filter(c => !isConventionalCommit(c.message));
  const patterns = analyzeCommitPatterns(legacyCommits);
  
  const analysis: MigrationAnalysis = {
    totalCommits: commits.length,
    conventionalCommits: conventionalCommits.length,
    legacyCommits: legacyCommits.length,
    patterns,
    recommendations: [],
    migrationStrategy: 'gradual',
  };
  
  analysis.recommendations = generateRecommendations(analysis);
  analysis.migrationStrategy = determineMigrationStrategy(analysis);
  
  // Display analysis
  console.log(chalk.blue('\n📊 Legacy Commit Analysis'));
  console.log(chalk.gray('='.repeat(50)));
  
  console.log(`\n📈 Commit Statistics:`);
  console.log(`   Total commits: ${chalk.blue(analysis.totalCommits)}`);
  console.log(`   Conventional commits: ${chalk.green(analysis.conventionalCommits)}`);
  console.log(`   Legacy commits: ${chalk.yellow(analysis.legacyCommits)}`);
  console.log(`   Migration rate: ${chalk.blue(((analysis.conventionalCommits / analysis.totalCommits) * 100).toFixed(1))}%`);
  
  console.log(`\n🎯 Migration Strategy: ${chalk.blue(analysis.migrationStrategy.toUpperCase())}`);
  
  console.log(`\n📋 Top Commit Patterns:`);
  analysis.patterns.slice(0, 10).forEach((pattern, index) => {
    console.log(`   ${index + 1}. "${pattern.pattern}" (${pattern.count} commits) → ${chalk.green(pattern.suggestedType)}`);
    pattern.examples.forEach(example => {
      console.log(`      Example: ${chalk.gray(example)}`);
    });
  });
  
  console.log(`\n💡 Recommendations:`);
  analysis.recommendations.forEach((rec, index) => {
    console.log(`   ${index + 1}. ${rec}`);
  });
  
  // Save to file if requested
  if (options.output) {
    fs.writeFileSync(options.output, JSON.stringify(analysis, null, 2));
    console.log(`\n💾 Analysis saved to ${chalk.blue(options.output)}`);
  }
};

// Migrate legacy project
export const migrateLegacyProject = async (options: { force?: boolean; startDate?: string }): Promise<void> => {
  console.log(chalk.blue('\n🔄 Legacy Project Migration'));
  console.log(chalk.gray('='.repeat(50)));
  
  // Check if project is already set up
  const isAlreadySetUp = fs.existsSync('commitlint.config.js') || fs.existsSync('.husky');
  
  if (isAlreadySetUp && !options.force) {
    console.log(chalk.yellow('⚠️  Project appears to already be set up for conventional commits.'));
    const { proceed } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'proceed',
        message: 'Do you want to proceed with migration anyway?',
        default: false,
      },
    ]);
    
    if (!proceed) {
      console.log(chalk.gray('Migration cancelled.'));
      return;
    }
  }
  
  // Analyze current state
  const range = options.startDate ? `--since="${options.startDate}"` : undefined;
  const commits = getCommitsWithDetails(range);
  const legacyCommits = commits.filter(c => !isConventionalCommit(c.message));
  
  console.log(`\n📊 Found ${chalk.blue(legacyCommits.length)} legacy commits to migrate`);
  
  if (legacyCommits.length === 0) {
    console.log(chalk.green('✅ No legacy commits found. Project is already using conventional commits!'));
    return;
  }
  
  // Setup conventional commit infrastructure
  console.log('\n🔧 Setting up conventional commit infrastructure...');
  
  // Install dependencies
  try {
    execSync('npm install --save-dev @commitlint/cli @commitlint/config-conventional husky', { stdio: 'ignore' });
    console.log(chalk.green('✅ Dependencies installed'));
  } catch (error) {
    console.log(chalk.red('❌ Failed to install dependencies'));
    return;
  }
  
  // Create commitlint config
  const commitlintConfig = `module.exports = {
  extends: ['@commitlint/config-conventional'],
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
  },
};`;
  
  fs.writeFileSync('commitlint.config.js', commitlintConfig);
  console.log(chalk.green('✅ Commitlint configuration created'));
  
  // Setup husky
  try {
    execSync('npx husky install', { stdio: 'ignore' });
    execSync('npx husky add .husky/commit-msg "npx --no -- commitlint --edit $1"', { stdio: 'ignore' });
    console.log(chalk.green('✅ Husky hooks configured'));
  } catch (error) {
    console.log(chalk.yellow('⚠️  Failed to setup husky hooks (you can add them manually later)'));
  }
  
  // Add npm scripts
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const scripts = {
    ...packageJson.scripts,
    'validate:commits': 'bumper validate',
    'changelog:preview': 'bumper preview',
    'release:patch': 'bumper release patch',
    'release:minor': 'bumper release minor',
    'release:major': 'bumper release major',
  };
  
  packageJson.scripts = scripts;
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
  console.log(chalk.green('✅ NPM scripts added'));
  
  console.log(chalk.green('\n✅ Migration completed!'));
  console.log(chalk.blue('\n📝 Next steps:'));
  console.log('   1. Run "bumper analyze-legacy" to see commit patterns');
  console.log('   2. Run "bumper bulk-format" to convert legacy commits');
  console.log('   3. Use "bumper suggest <message>" for new commits');
  console.log('   4. Use "bumper commit" for interactive commits');
};

// Bulk format legacy commits
export const bulkFormatCommits = async (options: BulkFormatOptions): Promise<void> => {
  console.log(chalk.blue('\n🔧 Bulk Formatting Legacy Commits'));
  console.log(chalk.gray('='.repeat(50)));
  
  const commits = getCommitsWithDetails(options.range);
  const legacyCommits = commits.filter(c => !isConventionalCommit(c.message));
  
  if (legacyCommits.length === 0) {
    console.log(chalk.green('✅ No legacy commits found to format'));
    return;
  }
  
  console.log(`\n📊 Found ${chalk.blue(legacyCommits.length)} legacy commits to format`);
  
  // Create mapping rules based on patterns
  const patterns = analyzeCommitPatterns(legacyCommits);
  const mappingRules = new Map<string, string>();
  
  for (const pattern of patterns) {
    if (pattern.count > 5) {
      mappingRules.set(pattern.pattern, pattern.suggestedType);
    }
  }
  
  console.log('\n📋 Using mapping rules:');
  mappingRules.forEach((type, pattern) => {
    console.log(`   "${pattern}" → ${chalk.green(type)}`);
  });
  
  // Format commits
  const formattedCommits: Array<{ original: LegacyCommit; formatted: string }> = [];
  
  for (const commit of legacyCommits) {
    const words = commit.message.toLowerCase().split(/\s+/);
    const firstWord = words[0];
    if (!firstWord) continue;
    const suggestedType = mappingRules.get(firstWord) || 'chore';
    
    // Clean and format message
    let cleanMessage = commit.message.trim();
    if (cleanMessage.endsWith('.')) {
      cleanMessage = cleanMessage.slice(0, -1);
    }
    
    // Capitalize first letter
    cleanMessage = cleanMessage.charAt(0).toUpperCase() + cleanMessage.slice(1);
    
    const formatted = `${suggestedType}: ${cleanMessage}`;
    formattedCommits.push({ original: commit, formatted });
  }
  
  // Display preview
  console.log('\n📝 Preview of formatted commits:');
  formattedCommits.slice(0, 10).forEach(({ original, formatted }) => {
    console.log(`   ${chalk.gray(original.hash)}: ${chalk.yellow(original.message)}`);
    console.log(`   ${chalk.gray('    →')} ${chalk.green(formatted)}`);
  });
  
  if (formattedCommits.length > 10) {
    console.log(`   ${chalk.gray(`... and ${formattedCommits.length - 10} more`)}`);
  }
  
  if (options.dryRun) {
    console.log(chalk.blue('\n🔍 Dry run completed. No changes made.'));
    return;
  }
  
  // Confirm before proceeding
  const { proceed } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'proceed',
      message: `Proceed with formatting ${formattedCommits.length} commits?`,
      default: false,
    },
  ]);
  
  if (!proceed) {
    console.log(chalk.gray('Bulk formatting cancelled.'));
    return;
  }
  
  // Apply changes using git filter-branch (this is a simplified version)
  console.log(chalk.yellow('\n⚠️  Warning: This will rewrite git history. Make sure to backup your repository first.'));
  
  const { confirmRewrite } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmRewrite',
      message: 'Are you sure you want to rewrite git history?',
      default: false,
    },
  ]);
  
  if (!confirmRewrite) {
    console.log(chalk.gray('History rewrite cancelled.'));
    return;
  }
  
  // Create a script to rewrite commits
  const rewriteScript = formattedCommits.map(({ original, formatted }) => {
    return `if [ "$GIT_COMMIT" = "${original.hash}" ]; then
  echo "${formatted}"
  exit 0
fi`;
  }).join('\n');
  
  const scriptContent = `#!/bin/bash
${rewriteScript}
echo "$GIT_COMMIT_MSG"
`;
  
  fs.writeFileSync('.git-rewrite-commits.sh', scriptContent);
  fs.chmodSync('.git-rewrite-commits.sh', '755');
  
  console.log(chalk.blue('\n🔧 Rewriting git history...'));
  
  try {
    execSync('git filter-branch --msg-filter ./.git-rewrite-commits.sh --all', { stdio: 'inherit' });
    fs.unlinkSync('.git-rewrite-commits.sh');
    console.log(chalk.green('\n✅ Git history rewritten successfully!'));
    console.log(chalk.blue('\n📝 Next steps:'));
    console.log('   1. Review the changes with "git log --oneline"');
    console.log('   2. Force push to remote: "git push --force-with-lease"');
    console.log('   3. Inform your team about the history rewrite');
  } catch (error) {
    console.log(chalk.red('\n❌ Failed to rewrite git history'));
    if (fs.existsSync('.git-rewrite-commits.sh')) {
      fs.unlinkSync('.git-rewrite-commits.sh');
    }
  }
};

// Draw a line in the sand - start fresh with conventional commits
export const drawLineInSand = async (options: LineInSandOptions): Promise<void> => {
  console.log(chalk.blue('\n🏖️  Drawing a Line in the Sand'));
  console.log(chalk.gray('='.repeat(50)));
  
  // Check if project is already set up
  const isAlreadySetUp = fs.existsSync('commitlint.config.js') || fs.existsSync('.husky');
  
  if (isAlreadySetUp && !options.force) {
    console.log(chalk.yellow('⚠️  Project appears to already be set up for conventional commits.'));
    const { proceed } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'proceed',
        message: 'Do you want to proceed with setup anyway?',
        default: false,
      },
    ]);
    
    if (!proceed) {
      console.log(chalk.gray('Setup cancelled.'));
      return;
    }
  }
  
  // Determine the starting point
  let startPoint = 'HEAD';
  let startDescription = 'current commit';
  
  if (options.startDate) {
    startPoint = `--since="${options.startDate}"`;
    startDescription = `commits since ${options.startDate}`;
  } else if (options.startCommit) {
    startPoint = options.startCommit;
    startDescription = `commits since ${options.startCommit}`;
  } else if (options.tag) {
    startPoint = options.tag;
    startDescription = `commits since tag ${options.tag}`;
  }
  
  console.log(`\n📊 Setting up conventional commits from: ${chalk.blue(startDescription)}`);
  
  // Analyze commits from the starting point
  const commits = getCommitsWithDetails(startPoint);
  const conventionalCommits = commits.filter(c => isConventionalCommit(c.message));
  const legacyCommits = commits.filter(c => !isConventionalCommit(c.message));
  
  console.log(`\n📈 Commit Analysis:`);
  console.log(`   Total commits from start point: ${chalk.blue(commits.length)}`);
  console.log(`   Conventional commits: ${chalk.green(conventionalCommits.length)}`);
  console.log(`   Legacy commits: ${chalk.yellow(legacyCommits.length)}`);
  
  if (legacyCommits.length > 0) {
    console.log(`\n💡 Note: ${chalk.yellow(legacyCommits.length)} legacy commits will remain unchanged`);
    console.log(`   Only new commits from this point forward will use conventional format`);
  }
  
  // Setup conventional commit infrastructure
  console.log('\n🔧 Setting up conventional commit infrastructure...');
  
  // Install dependencies
  try {
    execSync('npm install --save-dev @commitlint/cli @commitlint/config-conventional husky', { stdio: 'ignore' });
    console.log(chalk.green('✅ Dependencies installed'));
  } catch (error) {
    console.log(chalk.red('❌ Failed to install dependencies'));
    return;
  }
  
  // Create commitlint config
  const commitlintConfig = `module.exports = {
  extends: ['@commitlint/config-conventional'],
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
  },
};`;
  
  fs.writeFileSync('commitlint.config.js', commitlintConfig);
  console.log(chalk.green('✅ Commitlint configuration created'));
  
  // Setup husky
  try {
    execSync('npx husky install', { stdio: 'ignore' });
    execSync('npx husky add .husky/commit-msg "npx --no -- commitlint --edit $1"', { stdio: 'ignore' });
    console.log(chalk.green('✅ Husky hooks configured'));
  } catch (error) {
    console.log(chalk.yellow('⚠️  Failed to setup husky hooks (you can add them manually later)'));
  }
  
  // Add npm scripts
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const scripts = {
    ...packageJson.scripts,
    'validate:commits': 'bumper validate',
    'changelog:preview': 'bumper preview',
    'release:patch': 'bumper release patch',
    'release:minor': 'bumper release minor',
    'release:major': 'bumper release major',
  };
  
  packageJson.scripts = scripts;
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
  console.log(chalk.green('✅ NPM scripts added'));
  
  // Create a marker file or tag to indicate the line in the sand
  const markerContent = `# Conventional Commits Start Point

This file marks the beginning of conventional commit usage in this project.

- **Start Point**: ${startDescription}
- **Setup Date**: ${new Date().toISOString().split('T')[0]}
- **Previous Commits**: ${legacyCommits.length} legacy commits remain unchanged
- **Future Commits**: All new commits must follow conventional commit format

## Usage

- Use \`bumper commit\` for interactive commit creation
- Use \`bumper suggest "your message"\` for commit suggestions
- Use \`bumper validate\` to check commit format
- Use \`bumper preview\` to see changelog preview

## Migration Notes

- Legacy commits before this point are preserved as-is
- Changelog generation will include both legacy and conventional commits
- Legacy commits are categorized as 'chore' by default
- Consider gradual migration of legacy commits if desired

For more information, see: https://github.com/TheLeePriest/bumper
`;
  
  fs.writeFileSync('.conventional-commits-start', markerContent);
  console.log(chalk.green('✅ Start point marker created'));
  
  // Create a git tag to mark the line in the sand
  try {
    const tagName = `conventional-commits-start-${new Date().toISOString().split('T')[0]}`;
    execSync(`git tag ${tagName}`, { stdio: 'ignore' });
    console.log(chalk.green(`✅ Git tag created: ${tagName}`));
  } catch (error) {
    console.log(chalk.yellow('⚠️  Failed to create git tag (you can create it manually)'));
  }
  
  console.log(chalk.green('\n✅ Line in the sand drawn successfully!'));
  console.log(chalk.blue('\n📝 What this means:'));
  console.log(`   • All commits from ${chalk.blue(startDescription)} forward will use conventional format`);
  console.log(`   • Previous ${chalk.yellow(legacyCommits.length)} commits remain unchanged`);
  console.log(`   • Commit validation is now active for new commits`);
  console.log(`   • Changelog generation will work with mixed commit formats`);
  
  console.log(chalk.blue('\n🚀 Next steps:'));
  console.log('   1. Start using "bumper commit" for new commits');
  console.log('   2. Use "bumper suggest <message>" for commit suggestions');
  console.log('   3. Run "bumper preview" to see your changelog');
  console.log('   4. Consider gradual migration of legacy commits if desired');
  
  if (legacyCommits.length > 0) {
    console.log(chalk.yellow('\n💡 Tip: You can gradually migrate legacy commits using:'));
    console.log('   bumper analyze-legacy --range HEAD~50..HEAD');
    console.log('   bumper bulk-format --range HEAD~10..HEAD --dry-run');
  }
}; 