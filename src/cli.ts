#!/usr/bin/env node

import chalk from 'chalk';
import { Command } from 'commander';
import { generateChangelog } from './changelogGenerator';
import { createRelease } from './releaseTasks';
import { setupProject } from './setup';
import { validateCommits } from './validateCommits';
import { displayCommitSuggestions, createInteractiveCommit } from './commitFormatter';
import { handleCheckReleaseReadiness, handleAutoLabel, setupGitHubIntegration } from './githubIntegration';
import { migrateLegacyProject, analyzeLegacyCommits, bulkFormatCommits, drawLineInSand } from './legacySupport';

const program = new Command();

program.name('bumper').description('🚀 A magical release management system').version('1.0.0');

// Action handlers
const handlePreview = async () => {
  console.log(chalk.blue('🔍 Previewing your next release...'));
  await generateChangelog({ preview: true });
};

const handleGenerate = async () => {
  console.log(chalk.blue('📝 Generating changelog...'));
  await generateChangelog({ preview: false });
};

const handleValidate = async () => {
  console.log(chalk.blue('🔍 Validating commits...'));
  await validateCommits();
};

const handleRelease = async (type: 'patch' | 'minor' | 'major', options: { dryRun?: boolean }) => {
  console.log(chalk.blue(`🚀 Creating ${type} release...`));
  await createRelease({ type, dryRun: options.dryRun });
};

const handleSetup = async () => {
  console.log(chalk.blue('🔧 Setting up bumper...'));
  await setupProject();
};

const handleSuggest = async (message: string) => {
  displayCommitSuggestions(message);
};

const handleCommit = async () => {
  try {
    const commitMessage = await createInteractiveCommit();
    console.log(chalk.green('\n✅ Generated commit message:'));
    console.log(chalk.blue(commitMessage));
    console.log(chalk.gray('\n💡 Copy this message and use it with:'));
    console.log(chalk.gray('   git commit -m "your message here"'));
  } catch (error) {
    console.log(chalk.red('❌ Failed to create commit message:'), error);
  }
};

const handleReleaseReadiness = () => {
  handleCheckReleaseReadiness();
};

const handleAutoLabelPR = async (prNumber: string) => {
  await handleAutoLabel(prNumber);
};

const handleSetupGitHub = async () => {
  await setupGitHubIntegration();
};

const handleMigrateLegacy = async (options: { force?: boolean; startDate?: string }) => {
  console.log(chalk.blue('🔄 Migrating legacy project to conventional commits...'));
  await migrateLegacyProject(options);
};

const handleAnalyzeLegacy = async (options: { range?: string; output?: string }) => {
  console.log(chalk.blue('📊 Analyzing legacy commit patterns...'));
  await analyzeLegacyCommits(options);
};

const handleBulkFormat = async (options: { range?: string; dryRun?: boolean }) => {
  console.log(chalk.blue('🔧 Bulk formatting legacy commits...'));
  await bulkFormatCommits(options);
};

const handleLineInSand = async (options: { startDate?: string; startCommit?: string; tag?: string; force?: boolean }) => {
  console.log(chalk.blue('🏖️  Drawing a line in the sand...'));
  await drawLineInSand(options);
};

// Command definitions
program
  .command('preview')
  .description('Preview your next release')
  .action(handlePreview);

program
  .command('generate')
  .description('Generate changelog for next release')
  .action(handleGenerate);

program
  .command('validate')
  .description('Validate commit messages')
  .action(handleValidate);

program
  .command('release')
  .description('Create a new release')
  .argument('<type>', 'Release type: patch, minor, major')
  .option('--dry-run', 'Preview release without making changes')
  .action(handleRelease);

program
  .command('setup')
  .description('Setup bumper for your project')
  .action(handleSetup);

program
  .command('suggest')
  .description('Suggest conventional commit format for a message')
  .argument('<message>', 'The commit message to format')
  .action(handleSuggest);

program
  .command('commit')
  .description('Create a conventional commit interactively')
  .action(handleCommit);

program
  .command('check-release-readiness')
  .description('Check if release is ready based on GitHub labels and requirements')
  .action(handleReleaseReadiness);

program
  .command('auto-label')
  .description('Auto-label a PR based on commit messages')
  .argument('<pr-number>', 'The PR number to label')
  .action(handleAutoLabelPR);

program
  .command('setup-github')
  .description('Setup GitHub integration with auto-labeling and release validation')
  .action(handleSetupGitHub);

program
  .command('migrate-legacy')
  .description('Migrate a legacy project to conventional commits')
  .option('--force', 'Force migration even if project is already set up')
  .option('--start-date <date>', 'Start date for migration (YYYY-MM-DD)')
  .action(handleMigrateLegacy);

program
  .command('analyze-legacy')
  .description('Analyze legacy commit patterns and suggest migration strategy')
  .option('--range <range>', 'Git commit range to analyze (e.g., HEAD~50..HEAD)')
  .option('--output <file>', 'Output analysis to file')
  .action(handleAnalyzeLegacy);

program
  .command('bulk-format')
  .description('Bulk format legacy commits to conventional format')
  .option('--range <range>', 'Git commit range to format (e.g., HEAD~50..HEAD)')
  .option('--dry-run', 'Preview changes without applying them')
  .action(handleBulkFormat);

program
  .command('line-in-sand')
  .description('Draw a line in the sand - start using conventional commits from this point forward')
  .option('--start-date <date>', 'Start from commits since this date (YYYY-MM-DD)')
  .option('--start-commit <commit>', 'Start from this specific commit hash')
  .option('--tag <tag>', 'Start from this git tag')
  .option('--force', 'Force setup even if already configured')
  .action(handleLineInSand);

program.parse();
