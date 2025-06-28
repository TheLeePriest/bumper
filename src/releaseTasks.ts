#!/usr/bin/env node

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import ora from 'ora';
import { generateChangelog, getNextVersion } from './changelogGenerator.js';

interface ReleaseOptions {
  type: 'patch' | 'minor' | 'major';
  dryRun?: boolean;
}

interface ReleaseResult {
  success: boolean;
  version: string;
  tag: string;
  changelog: string;
}

// Validate git status
function validateGitStatus(): void {
  const status = execSync('git status --porcelain', {
    encoding: 'utf8',
  }).trim();

  if (status) {
    console.log(chalk.red('❌ Working directory is not clean!'));
    console.log(chalk.yellow('Please commit or stash your changes before releasing.'));
    console.log('\nUncommitted changes:');
    console.log(status);
    process.exit(1);
  }

  // Check if we're on main branch
  const currentBranch = execSync('git branch --show-current', {
    encoding: 'utf8',
  }).trim();
  if (currentBranch !== 'main' && currentBranch !== 'master') {
    console.log(
      chalk.yellow(
        `⚠️ You're on branch "${currentBranch}". Consider switching to main/master for releases.`
      )
    );
  }
}

// Update package.json version
function updatePackageVersion(version: string): void {
  const packagePath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

  packageJson.version = version;
  fs.writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);
}

// Create git tag
function createGitTag(version: string, message: string): void {
  execSync(`git tag -a v${version} -m "${message}"`, { stdio: 'inherit' });
}

// Push changes to remote
function pushToRemote(version: string): void {
  execSync('git push', { stdio: 'inherit' });
  execSync(`git push origin v${version}`, { stdio: 'inherit' });
}

// Publish to npm
function publishToNpm(): void {
  execSync('npm publish', { stdio: 'inherit' });
}

// Create GitHub release
async function createGitHubRelease(version: string, changelog: string): Promise<void> {
  try {
    // Check if gh CLI is available
    execSync('gh --version', { stdio: 'ignore' });

    const releaseNotes =
      changelog
        .split('\n')
        .filter((changelogLine) => changelogLine.startsWith('## ['))
        .pop() || '';

    execSync(
      `gh release create v${version} --title "Release v${version}" --notes "${releaseNotes}"`,
      {
        stdio: 'inherit',
      }
    );

    console.log(chalk.green('✅ GitHub release created successfully!'));
  } catch (_error) {
    console.log(
      chalk.yellow('⚠️ GitHub CLI not available or failed. Please create release manually.')
    );
    console.log(chalk.blue(`📝 Release notes: ${changelog}`));
  }
}

// Main release function
export async function createRelease(options: ReleaseOptions): Promise<ReleaseResult> {
  const { type, dryRun = false } = options;

  console.log(chalk.blue(`🚀 Starting ${dryRun ? 'DRY RUN ' : ''}release process...`));

  if (!dryRun) {
    validateGitStatus();
  }

  // Read current version
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const currentVersion = packageJson.version;
  const nextVersion = getNextVersion(currentVersion, type);

  console.log(chalk.cyan(`📦 Version: ${currentVersion} → ${nextVersion}`));
  console.log(chalk.cyan(`🎯 Release Type: ${type.toUpperCase()}`));

  // Generate changelog
  const spinner = ora('Generating changelog...').start();
  await generateChangelog({ preview: false });
  spinner.succeed('Changelog generated');

  // Read the generated changelog
  const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
  const changelogContent = fs.readFileSync(changelogPath, 'utf8');

  // Extract the latest release notes
  const releaseNotes =
    changelogContent
      .split('\n')
      .filter((changelogLine) => changelogLine.startsWith('## ['))
      .pop() || '';

  if (dryRun) {
    console.log('\n📋 DRY RUN - What would happen:');
    console.log('='.repeat(50));
    console.log(`1. Update package.json version to ${nextVersion}`);
    console.log(`2. Commit changes with message: "chore: release v${nextVersion}"`);
    console.log(`3. Create git tag: v${nextVersion}`);
    console.log('4. Push changes and tag to remote');
    console.log('5. Publish to npm');
    console.log('6. Create GitHub release');
    console.log('='.repeat(50));
    console.log('\n📝 Release notes preview:');
    console.log(releaseNotes);

    return {
      success: true,
      version: nextVersion,
      tag: `v${nextVersion}`,
      changelog: releaseNotes,
    };
  }

  // Update package.json
  spinner.text = 'Updating package.json...';
  spinner.start();
  updatePackageVersion(nextVersion);
  spinner.succeed('Package.json updated');

  // Commit changes
  spinner.text = 'Committing changes...';
  spinner.start();
  execSync('git add .', { stdio: 'ignore' });
  execSync(`git commit -m "chore: release v${nextVersion}"`, {
    stdio: 'ignore',
  });
  spinner.succeed('Changes committed');

  // Create tag
  spinner.text = 'Creating git tag...';
  spinner.start();
  createGitTag(nextVersion, `Release v${nextVersion}`);
  spinner.succeed('Git tag created');

  // Push to remote
  spinner.text = 'Pushing to remote...';
  spinner.start();
  pushToRemote(nextVersion);
  spinner.succeed('Pushed to remote');

  // Publish to npm
  spinner.text = 'Publishing to npm...';
  spinner.start();
  publishToNpm();
  spinner.succeed('Published to npm');

  // Create GitHub release
  spinner.text = 'Creating GitHub release...';
  spinner.start();
  await createGitHubRelease(nextVersion, releaseNotes);
  spinner.succeed('GitHub release created');

  console.log(chalk.green('\n🎉 Release completed successfully!'));
  console.log(chalk.blue(`📦 Version: ${nextVersion}`));
  console.log(chalk.blue(`🏷️ Tag: v${nextVersion}`));
  console.log(
    chalk.blue(`📚 NPM: https://www.npmjs.com/package/${packageJson.name}/v/${nextVersion}`)
  );

  return {
    success: true,
    version: nextVersion,
    tag: `v${nextVersion}`,
    changelog: releaseNotes,
  };
}
