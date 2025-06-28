#!/usr/bin/env node

import { execSync } from 'node:child_process';
import chalk from 'chalk';

interface CommitValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Conventional commit regex pattern
const CONVENTIONAL_COMMIT_REGEX =
  /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert|security)(\([\w-]+\))?(!)?:\s.+$/;

// Parse commit message
function parseCommitMessage(message: string): {
  type: string;
  scope?: string;
  breaking: boolean;
  subject: string;
} {
  const match = message.match(CONVENTIONAL_COMMIT_REGEX);

  if (!match) {
    return {
      type: 'invalid',
      breaking: false,
      subject: message,
    };
  }

  const [, commitType, commitScope, isBreaking] = match;
  const subject = message.substring(message.indexOf(':') + 1).trim();

  return {
    type: commitType || 'invalid',
    scope: commitScope ? commitScope.slice(1, -1) : undefined,
    breaking: !!isBreaking,
    subject,
  };
}

// Validate single commit message
function validateCommitMessage(message: string): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if message follows conventional commit format
  if (!CONVENTIONAL_COMMIT_REGEX.test(message)) {
    errors.push('Commit message does not follow conventional commit format');
  }

  // Check message length
  if (message.length > 72) {
    warnings.push('Commit message is longer than 72 characters');
  }

  // Check for common issues
  if (message.toLowerCase().includes('wip')) {
    warnings.push(
      'Commit message contains "WIP" - consider squashing before release'
    );
  }

  if (message.toLowerCase().includes('fixup')) {
    warnings.push(
      'Commit message contains "fixup" - consider squashing before release'
    );
  }

  // Parse and validate structure
  const parsed = parseCommitMessage(message);

  if (parsed.type === 'invalid') {
    errors.push('Invalid commit type');
  }

  // Validate subject
  if (parsed.subject.length === 0) {
    errors.push('Commit subject is empty');
  }

  if (parsed.subject.endsWith('.')) {
    warnings.push('Commit subject ends with a period');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// Get commits since last tag
function getCommitsSinceLastTag(): Array<{ hash: string; message: string }> {
  try {
    const lastTag = execSync('git describe --tags --abbrev=0', {
      encoding: 'utf8',
    }).trim();
    const commits = execSync(
      `git log --pretty=format:"%H|%s" ${lastTag}..HEAD`,
      { encoding: 'utf8' }
    ).trim();

    if (!commits) return [];

    return commits.split('\n').map((commitLine: string) => {
      const commitParts = commitLine.split('|');
      const commitHash = commitParts[0] || '';
      const commitMessage = commitParts[1] || '';

      return {
        hash: commitHash.substring(0, 8),
        message: commitMessage,
      };
    });
  } catch {
    // If no tags exist, get all commits
    const commits = execSync('git log --pretty=format:"%H|%s"', {
      encoding: 'utf8',
    }).trim();

    if (!commits) return [];

    return commits.split('\n').map((commitLine: string) => {
      const commitParts = commitLine.split('|');
      const commitHash = commitParts[0] || '';
      const commitMessage = commitParts[1] || '';

      return {
        hash: commitHash.substring(0, 8),
        message: commitMessage,
      };
    });
  }
}

// Main validation function
export async function validateCommits(): Promise<CommitValidationResult> {
  console.log(chalk.blue('🔍 Validating commit messages...'));

  const commits = getCommitsSinceLastTag();

  if (commits.length === 0) {
    console.log(chalk.yellow('⚠️ No commits found to validate.'));
    return { isValid: true, errors: [], warnings: [] };
  }

  console.log(chalk.green(`📝 Validating ${commits.length} commits...`));

  const results: CommitValidationResult[] = [];
  let totalErrors = 0;
  let totalWarnings = 0;

  for (const { hash, message } of commits) {
    const validationResult = validateCommitMessage(message);
    results.push(validationResult);

    if (validationResult.errors.length > 0) {
      totalErrors += validationResult.errors.length;
      console.log(chalk.red(`❌ ${hash}: ${message}`));
      for (const errorMessage of validationResult.errors) {
        console.log(chalk.red(`   - ${errorMessage}`));
      }
    } else if (validationResult.warnings.length > 0) {
      totalWarnings += validationResult.warnings.length;
      console.log(chalk.yellow(`⚠️ ${hash}: ${message}`));
      for (const warningMessage of validationResult.warnings) {
        console.log(chalk.yellow(`   - ${warningMessage}`));
      }
    } else {
      console.log(chalk.green(`✅ ${hash}: ${message}`));
    }
  }

  // Summary
  console.log('\n📊 Validation Summary:');
  console.log(`Total commits: ${chalk.blue(commits.length)}`);
  console.log(
    `Valid commits: ${chalk.green(
      commits.length - results.filter((result) => !result.isValid).length
    )}`
  );
  console.log(
    `Invalid commits: ${chalk.red(results.filter((result) => !result.isValid).length)}`
  );
  console.log(`Total errors: ${chalk.red(totalErrors)}`);
  console.log(`Total warnings: ${chalk.yellow(totalWarnings)}`);

  const allErrors = results.flatMap((result) => result.errors);
  const allWarnings = results.flatMap((result) => result.warnings);

  if (totalErrors > 0) {
    console.log(
      chalk.red('\n❌ Validation failed! Please fix the errors above.')
    );
    console.log(
      chalk.blue('💡 Tip: Use "git commit --amend" to fix recent commits')
    );
  } else if (totalWarnings > 0) {
    console.log(chalk.yellow('\n⚠️ Validation passed with warnings.'));
  } else {
    console.log(chalk.green('\n✅ All commits are valid!'));
  }

  return {
    isValid: totalErrors === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
}

// Export for use in other modules
export { validateCommitMessage, parseCommitMessage };
