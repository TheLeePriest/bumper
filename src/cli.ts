#!/usr/bin/env node

import chalk from 'chalk';
import { Command } from 'commander';
import { generateChangelog } from './changelogGenerator.js';
import { createRelease } from './releaseTasks.js';
import { setupProject } from './setup.js';
import { validateCommits } from './validateCommits.js';

const program = new Command();

program.name('bumper').description('🚀 A magical release management system').version('1.0.0');

program
  .command('preview')
  .description('Preview your next release')
  .action(async () => {
    console.log(chalk.blue('🔍 Previewing your next release...'));
    await generateChangelog({ preview: true });
  });

program
  .command('generate')
  .description('Generate changelog for next release')
  .action(async () => {
    console.log(chalk.blue('📝 Generating changelog...'));
    await generateChangelog({ preview: false });
  });

program
  .command('validate')
  .description('Validate commit messages')
  .action(async () => {
    console.log(chalk.blue('🔍 Validating commits...'));
    await validateCommits();
  });

program
  .command('release')
  .description('Create a new release')
  .argument('<type>', 'Release type: patch, minor, major')
  .option('--dry-run', 'Preview release without making changes')
  .action(async (type, options) => {
    console.log(chalk.blue(`🚀 Creating ${type} release...`));
    await createRelease({ type, dryRun: options.dryRun });
  });

program
  .command('setup')
  .description('Setup bumper for your project')
  .action(async () => {
    console.log(chalk.blue('🔧 Setting up bumper...'));
    await setupProject();
  });

program.parse();
