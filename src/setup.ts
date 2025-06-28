#!/usr/bin/env node

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import inquirer from 'inquirer';

interface SetupOptions {
  force?: boolean;
}

function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function installPackage(packageName: string, dev = false): void {
  const command = dev ? `npm install --save-dev ${packageName}` : `npm install ${packageName}`;
  execSync(command, { stdio: 'ignore' });
}

// Create commitlint configuration
function createCommitlintConfig(): void {
  const config = {
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
      'type-case': [2, 'always', 'lower'],
      'type-empty': [2, 'never'],
      'subject-case': [2, 'always', 'lower'],
      'subject-empty': [2, 'never'],
      'subject-full-stop': [2, 'never', '.'],
      'header-max-length': [2, 'always', 72],
    },
  };

  fs.writeFileSync('commitlint.config.json', `${JSON.stringify(config, null, 2)}\n`);
}

// Create GitHub Actions workflow
function createGitHubWorkflow(): void {
  const workflowDir = '.github/workflows';
  ensureDir(workflowDir);

  const workflow = `name: Automated Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      packages: write
      issues: write
      pull-requests: write

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: \${{ secrets.GITHUB_TOKEN }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test

      - name: Build project
        run: npm run build

      - name: Validate commits
        run: npx bumper validate

      - name: Generate changelog
        run: npx bumper generate

      - name: Publish to NPM
        run: npm publish
        env:
          NODE_AUTH_TOKEN: \${{ secrets.NPM_TOKEN }}

      - name: Create GitHub Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: \${{ github.ref }}
          release_name: Release \${{ github.ref_name }}
          body_path: CHANGELOG.md
          draft: false
          prerelease: false

      - name: Update release notes
        run: |
          # Extract the latest changelog entry
          CHANGELOG_CONTENT=\$(cat CHANGELOG.md)
          LATEST_ENTRY=\$(echo "\$CHANGELOG_CONTENT" | sed -n '/^## [\\'\${{ github.ref_name }}'\\']/,/^## \\[/p' | sed '\\$d')

          # Update the GitHub release with formatted content
          gh api \\
            --method PATCH \\
            /repos/\${{ github.repository }}/releases/latest \\
            --field body="\$LATEST_ENTRY"
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}

      - name: Notify release
        run: |
          echo "🎉 Release \${{ github.ref_name }} has been published!"
          echo "📦 NPM: https://www.npmjs.com/package/\${{ github.repository }}"
          echo "🏷️ GitHub: https://github.com/\${{ github.repository }}/releases/tag/\${{ github.ref }}"
`;

  fs.writeFileSync(path.join(workflowDir, 'release.yml'), workflow);
}

// Create Husky hooks
function createHuskyHooks(): void {
  const huskyDir = '.husky';
  ensureDir(huskyDir);

  // Create commit-msg hook
  const commitMsgHook = `#!/usr/bin/env sh
. "\$(dirname -- "\$0")/_/husky.sh"

npx --no -- commitlint --edit \$1
`;

  fs.writeFileSync(path.join(huskyDir, 'commit-msg'), commitMsgHook);
  fs.chmodSync(path.join(huskyDir, 'commit-msg'), '755');

  // Create pre-push hook
  const prePushHook = `#!/usr/bin/env sh
. "\$(dirname -- "\$0")/_/husky.sh"

npm run test
`;

  fs.writeFileSync(path.join(huskyDir, 'pre-push'), prePushHook);
  fs.chmodSync(path.join(huskyDir, 'pre-push'), '755');
}

// Update package.json scripts
function updatePackageScripts(): void {
  const packagePath = 'package.json';
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

  // Add convenience scripts (bumper script is automatically available via bin field)
  const bumperScripts = {
    ...packageJson.scripts,
    'validate:commits': './node_modules/.bin/bumper validate',
    'changelog:preview': './node_modules/.bin/bumper preview',
    'changelog:generate': './node_modules/.bin/bumper generate',
    'release:patch': './node_modules/.bin/bumper release patch',
    'release:minor': './node_modules/.bin/bumper release minor',
    'release:major': './node_modules/.bin/bumper release major',
    'release:dry-run': './node_modules/.bin/bumper release patch --dry-run',
    prepare: 'husky install',
  };

  packageJson.scripts = bumperScripts;
  fs.writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);
}

// Create initial changelog
function createInitialChangelog(): void {
  const changelog = `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project setup

`;

  fs.writeFileSync('CHANGELOG.md', changelog);
}

// Main setup function
export async function setupProject(options: SetupOptions = {}): Promise<void> {
  const { force = false } = options;

  console.log(chalk.blue('🔧 Setting up bumper for your project...'));

  // Check if already set up
  if (!force && (fileExists('commitlint.config.json') || fileExists('.husky'))) {
    console.log(chalk.yellow('⚠️ Project appears to already be set up.'));
    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: 'Do you want to overwrite existing configuration?',
        default: false,
      },
    ]);

    if (!overwrite) {
      console.log(chalk.blue('Setup cancelled.'));
      return;
    }
  }

  // Install dependencies
  console.log(chalk.blue('📦 Installing dependencies...'));

  const dependencies = ['@commitlint/cli', '@commitlint/config-conventional', 'husky'];

  for (const dependency of dependencies) {
    console.log(chalk.gray(`Installing ${dependency}...`));
    installPackage(dependency, true);
  }

  // Create configuration files
  console.log(chalk.blue('📝 Creating configuration files...'));

  createCommitlintConfig();
  createGitHubWorkflow();
  createHuskyHooks();

  if (!fileExists('CHANGELOG.md')) {
    createInitialChangelog();
  }

  // Update package.json
  console.log(chalk.blue('📋 Updating package.json...'));
  updatePackageScripts();

  // Initialize Husky
  console.log(chalk.blue('🐕 Setting up Husky...'));
  execSync('npx husky install', { stdio: 'inherit' });

  console.log(chalk.green('\n✅ Setup completed successfully!'));
  console.log(chalk.blue('\n📚 What was set up:'));
  console.log('  • Conventional commit validation');
  console.log('  • Git hooks with Husky');
  console.log('  • GitHub Actions workflow');
  console.log('  • Initial changelog');
  console.log('  • NPM scripts for releases');

  console.log(chalk.blue('\n🚀 Next steps:'));
  console.log('  1. Make your first conventional commit:');
  console.log('     git commit -m "feat: add amazing feature"');
  console.log('  2. Preview your release:');
  console.log('     npm run changelog:preview');
  console.log('  3. Create a release:');
  console.log('     npm run release:patch');

  console.log(chalk.blue('\n📖 Learn more:'));
  console.log('  • Conventional Commits: https://conventionalcommits.org/');
  console.log('  • Semantic Versioning: https://semver.org/');
} 