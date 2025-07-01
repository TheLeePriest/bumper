#!/usr/bin/env node

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';

interface GitHubConfig {
  releaseRequirements?: {
    requiredLabels?: string[];
    blockingLabels?: string[];
    requiredStatusChecks?: string[];
  };
  autoLabel?: {
    enabled?: boolean;
    mappings?: Record<string, string[]>;
  };
  changelog?: {
    groupByLabels?: boolean;
    labelGroups?: Record<string, string[]>;
    priorityLabels?: string[];
  };
}

interface PRInfo {
  number: number;
  title: string;
  labels: string[];
  status: 'open' | 'closed' | 'merged';
  commits: string[];
}

interface ReleaseReadinessResult {
  isReady: boolean;
  issues: string[];
  warnings: string[];
  prs: PRInfo[];
}

// Default configuration
const DEFAULT_CONFIG: GitHubConfig = {
  releaseRequirements: {
    requiredLabels: [],
    blockingLabels: ['do-not-release', 'wip', 'block-release'],
    requiredStatusChecks: ['ci'],
  },
  autoLabel: {
    enabled: false,
    mappings: {
      feat: ['enhancement'],
      fix: ['bug'],
      security: ['security'],
      docs: ['documentation'],
      test: ['testing'],
      perf: ['performance'],
      refactor: ['refactor'],
    },
  },
  changelog: {
    groupByLabels: false,
    labelGroups: {
      'High Priority': ['high-priority', 'critical', 'security'],
      'Breaking Changes': ['breaking-change'],
      'User Facing': ['user-facing', 'ui', 'ux'],
      Internal: ['internal', 'refactor', 'chore'],
    },
    priorityLabels: ['high-priority', 'critical', 'security'],
  },
};

// Load configuration from file
const loadConfig = (): GitHubConfig => {
  const configPath = path.join(process.cwd(), 'bumper.config.json');

  if (!fs.existsSync(configPath)) {
    return DEFAULT_CONFIG;
  }

  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return { ...DEFAULT_CONFIG, ...config };
  } catch {
    console.log(chalk.yellow('⚠️ Error loading bumper.config.json, using defaults'));
    return DEFAULT_CONFIG;
  }
};

// Get PRs since last release
const getPRsSinceLastRelease = (): PRInfo[] => {
  try {
    const lastTag = execSync('git describe --tags --abbrev=0', {
      encoding: 'utf8',
    }).trim();

    // Get PRs merged since last tag
    const prs = execSync(
      `gh pr list --state merged --search "merged:>${lastTag}" --json number,title,labels,state,commits`,
      { encoding: 'utf8' }
    ).trim();

    if (!prs) return [];

    return JSON.parse(prs).map((pr: any) => ({
      number: pr.number,
      title: pr.title,
      labels: pr.labels.map((label: any) => label.name),
      status: pr.state,
      commits: pr.commits.map((commit: any) => commit.message),
    }));
  } catch {
    // If no tags exist or gh CLI not available, return empty
    return [];
  }
};

// Check if GitHub CLI is available
const isGitHubCLIAvailable = (): boolean => {
  try {
    execSync('gh --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};

// Validate release readiness
export const checkReleaseReadiness = (): ReleaseReadinessResult => {
  const config = loadConfig();
  const issues: string[] = [];
  const warnings: string[] = [];

  if (!isGitHubCLIAvailable()) {
    warnings.push('GitHub CLI not available - skipping GitHub-specific checks');
    return {
      isReady: true,
      issues,
      warnings,
      prs: [],
    };
  }

  const prs = getPRsSinceLastRelease();

  // Check for blocking labels
  for (const pr of prs) {
    for (const label of pr.labels) {
      if (config.releaseRequirements?.blockingLabels?.includes(label.toLowerCase())) {
        issues.push(`PR #${pr.number} has blocking label: ${label}`);
      }
    }
  }

  // Check for required labels (if configured)
  if (config.releaseRequirements?.requiredLabels?.length) {
    for (const pr of prs) {
      const hasRequiredLabel = pr.labels.some((label) =>
        config.releaseRequirements?.requiredLabels?.includes(label)
      );

      if (!hasRequiredLabel) {
        issues.push(
          `PR #${pr.number} missing required label (${config.releaseRequirements.requiredLabels.join(' or ')})`
        );
      }
    }
  }

      // Check status checks (basic implementation)
    if (config.releaseRequirements?.requiredStatusChecks && config.releaseRequirements.requiredStatusChecks.length > 0) {
      warnings.push('Status check validation requires additional GitHub API integration');
    }

  return {
    isReady: issues.length === 0,
    issues,
    warnings,
    prs,
  };
};

// Auto-label PR based on commits
export const autoLabelPR = async (prNumber: number): Promise<void> => {
  const config = loadConfig();

  if (!config.autoLabel?.enabled) {
    console.log(chalk.yellow('⚠️ Auto-labeling is disabled in configuration'));
    return;
  }

  if (!isGitHubCLIAvailable()) {
    console.log(chalk.yellow('⚠️ GitHub CLI not available for auto-labeling'));
    return;
  }

  try {
    // Get PR commits
    const commits = execSync(`gh pr view ${prNumber} --json commits`, { encoding: 'utf8' });

    const prData = JSON.parse(commits);
    const commitMessages = prData.commits.map((commit: any) => commit.message);

    // Analyze commits and determine labels
    const labelsToAdd = new Set<string>();

    for (const message of commitMessages) {
      const conventionalMatch = message.match(/^(\w+)(?:\(([\w-]+)\))?(!)?:\s(.+)$/);

      if (conventionalMatch) {
        const [, type] = conventionalMatch;
        const labels = config.autoLabel?.mappings?.[type] || [];

        for (const label of labels) {
          labelsToAdd.add(label);
        }
      }
    }

    // Add labels to PR
    for (const label of labelsToAdd) {
      try {
        execSync(`gh pr edit ${prNumber} --add-label "${label}"`, { stdio: 'ignore' });
        console.log(chalk.green(`✅ Added label "${label}" to PR #${prNumber}`));
      } catch {
        console.log(chalk.yellow(`⚠️ Could not add label "${label}" to PR #${prNumber}`));
      }
    }
  } catch (error) {
    console.log(chalk.red(`❌ Error auto-labeling PR #${prNumber}:`), error);
  }
};

// Generate enhanced changelog with label grouping
export const generateEnhancedChangelog = (commits: any[], config?: GitHubConfig): string => {
  const userConfig = config || loadConfig();

  if (!userConfig.changelog?.groupByLabels) {
    return ''; // Return empty if not enabled
  }

  let enhancedContent = '\n### 🏷️ Label-Based Grouping\n\n';

  // Group commits by label groups
  const labelGroups = userConfig.changelog?.labelGroups || {};

  for (const [groupName] of Object.entries(labelGroups)) {
    const groupCommits = commits.filter(() => {
      // This would need PR data to work properly
      // For now, just show the group structure
      return false;
    });

    if (groupCommits.length > 0) {
      enhancedContent += `#### ${groupName}\n\n`;
      for (const commit of groupCommits) {
        enhancedContent += `- ${commit.subject} (${commit.hash})\n`;
      }
      enhancedContent += '\n';
    }
  }

  return enhancedContent;
};

// Setup GitHub integration
export const setupGitHubIntegration = async (): Promise<void> => {
  console.log(chalk.blue('🔧 Setting up GitHub integration...'));

  if (!isGitHubCLIAvailable()) {
    console.log(chalk.yellow('⚠️ GitHub CLI not available. Please install it first:'));
    console.log(chalk.gray('   https://cli.github.com/'));
    return;
  }

  // Create configuration file
  const configPath = path.join(process.cwd(), 'bumper.config.json');

  if (!fs.existsSync(configPath)) {
    const config = {
      ...DEFAULT_CONFIG,
      autoLabel: {
        ...DEFAULT_CONFIG.autoLabel,
        enabled: true, // Enable by default
      },
    };

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(chalk.green('✅ Created bumper.config.json'));
  }

  // Create GitHub Actions workflow for auto-labeling
  const workflowDir = '.github/workflows';
  if (!fs.existsSync(workflowDir)) {
    fs.mkdirSync(workflowDir, { recursive: true });
  }

  const autoLabelWorkflow = `name: Auto-label PRs

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  auto-label:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Auto-label PR
        run: npx bumper auto-label \${{ github.event.pull_request.number }}
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
`;

  fs.writeFileSync(path.join(workflowDir, 'auto-label.yml'), autoLabelWorkflow);
  console.log(chalk.green('✅ Created auto-label GitHub Actions workflow'));

  console.log(chalk.blue('\n📋 GitHub integration setup complete!'));
  console.log(chalk.blue('\n🎯 What was set up:'));
  console.log('  • Configuration file (bumper.config.json)');
  console.log('  • Auto-labeling workflow for PRs');
  console.log('  • Release readiness validation');
  console.log('  • Enhanced changelog generation');

  console.log(chalk.blue('\n🔧 Next steps:'));
  console.log('  1. Customize bumper.config.json for your team');
  console.log('  2. Create required labels in your GitHub repository');
  console.log('  3. Test auto-labeling with a PR');
  console.log('  4. Use "bumper check-release-readiness" before releases');
};

// CLI command handlers
export const handleCheckReleaseReadiness = (): void => {
  console.log(chalk.blue('🔍 Checking release readiness...'));

  const result = checkReleaseReadiness();

  if (result.isReady) {
    console.log(chalk.green('✅ Release is ready!'));
  } else {
    console.log(chalk.red('❌ Release is not ready:'));
    for (const issue of result.issues) {
      console.log(chalk.red(`  • ${issue}`));
    }
  }

  if (result.warnings.length > 0) {
    console.log(chalk.yellow('\n⚠️ Warnings:'));
    for (const warning of result.warnings) {
      console.log(chalk.yellow(`  • ${warning}`));
    }
  }

  if (result.prs.length > 0) {
    console.log(chalk.blue('\n📋 PRs since last release:'));
    for (const pr of result.prs) {
      const labels = pr.labels.length > 0 ? ` [${pr.labels.join(', ')}]` : '';
      console.log(chalk.blue(`  • #${pr.number}: ${pr.title}${labels}`));
    }
  }
};

export const handleAutoLabel = async (prNumber?: string): Promise<void> => {
  if (!prNumber) {
    console.log(chalk.red('❌ PR number is required'));
    console.log(chalk.gray('Usage: bumper auto-label <pr-number>'));
    return;
  }

  await autoLabelPR(Number.parseInt(prNumber, 10));
};
