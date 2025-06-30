#!/usr/bin/env node

import chalk from 'chalk';
import { Command } from 'commander';
import { generateChangelog } from './changelogGenerator';
import { createRelease } from './releaseTasks';
import { setupProject } from './setup';
import { validateCommits } from './validateCommits';
import { displayCommitSuggestions, createInteractiveCommit } from './commitFormatter';

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

program.parse();
