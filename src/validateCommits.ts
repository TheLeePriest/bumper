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
const parseCommitMessage = (message: string): {
  type: string;
  scope?: string;
  breaking: boolean;
  subject: string;
} => {
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
};

// Check for common commit issues
const checkCommonIssues = (message: string): string[] => {
  const warnings: string[] = [];
  
  if (message.toLowerCase().includes('wip')) {
    warnings.push('Commit message contains "WIP" - consider squashing before release');
  }
  
  if (message.toLowerCase().includes('fixup')) {
    warnings.push('Commit message contains "fixup" - consider squashing before release');
  }
  
  return warnings;
};

// Validate commit structure
const validateCommitStructure = (parsed: ReturnType<typeof parseCommitMessage>): string[] => {
  const errors: string[] = [];
  
  if (parsed.type === 'invalid') {
    errors.push('Invalid commit type');
  }
  
  if (parsed.subject.length === 0) {
    errors.push('Commit subject is empty');
  }
  
  return errors;
};

// Validate commit subject
const validateCommitSubject = (parsed: ReturnType<typeof parseCommitMessage>): string[] => {
  const warnings: string[] = [];
  
  if (parsed.subject.endsWith('.')) {
    warnings.push('Commit subject ends with a period');
  }
  
  return warnings;
};

// Validate single commit message
const validateCommitMessage = (message: string): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} => {
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
  warnings.push(...checkCommonIssues(message));

  // Parse and validate structure
  const parsed = parseCommitMessage(message);
  errors.push(...validateCommitStructure(parsed));
  warnings.push(...validateCommitSubject(parsed));

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

// Parse commit line from git log
const parseCommitLine = (commitLine: string): { hash: string; message: string } => {
  const commitParts = commitLine.split('|');
  const commitHash = commitParts[0] || '';
  const commitMessage = commitParts[1] || '';

  return {
    hash: commitHash.substring(0, 8),
    message: commitMessage,
  };
};

// Get commits from git log
const getCommitsFromGitLog = (range?: string): Array<{ hash: string; message: string }> => {
  const command = range 
    ? `git log --pretty=format:"%H|%s" ${range}`
    : 'git log --pretty=format:"%H|%s"';
    
  const commits = execSync(command, { encoding: 'utf8' }).trim();
  
  if (!commits) return [];
  
  return commits.split('\n').map(parseCommitLine);
};

// Get commits since last tag
const getCommitsSinceLastTag = (): Array<{ hash: string; message: string }> => {
  try {
    const lastTag = execSync('git describe --tags --abbrev=0', {
      encoding: 'utf8',
    }).trim();
    return getCommitsFromGitLog(`${lastTag}..HEAD`);
  } catch {
    // If no tags exist, get all commits
    return getCommitsFromGitLog();
  }
};

// Display validation result for a single commit
const displayCommitValidation = (
  hash: string, 
  message: string, 
  validationResult: ReturnType<typeof validateCommitMessage>
): { errors: number; warnings: number } => {
  let errors = 0;
  let warnings = 0;

  if (validationResult.errors.length > 0) {
    errors = validationResult.errors.length;
    console.log(chalk.red(`❌ ${hash}: ${message}`));
    for (const errorMessage of validationResult.errors) {
      console.log(chalk.red(`   - ${errorMessage}`));
    }
  } else if (validationResult.warnings.length > 0) {
    warnings = validationResult.warnings.length;
    console.log(chalk.yellow(`⚠️ ${hash}: ${message}`));
    for (const warningMessage of validationResult.warnings) {
      console.log(chalk.yellow(`   - ${warningMessage}`));
    }
  } else {
    console.log(chalk.green(`✅ ${hash}: ${message}`));
  }

  return { errors, warnings };
};

// Display validation summary
const displayValidationSummary = (
  commits: Array<{ hash: string; message: string }>,
  results: ReturnType<typeof validateCommitMessage>[],
  totalErrors: number,
  totalWarnings: number
): void => {
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
};

// Display final validation message
const displayFinalMessage = (totalErrors: number, totalWarnings: number): void => {
  if (totalErrors > 0) {
    console.log(chalk.red('\n❌ Validation failed! Please fix the errors above.'));
    console.log(chalk.blue('💡 Tip: Use "git commit --amend" to fix recent commits'));
  } else if (totalWarnings > 0) {
    console.log(chalk.yellow('\n⚠️ Validation passed with warnings.'));
  } else {
    console.log(chalk.green('\n✅ All commits are valid!'));
  }
};

// Main validation function
export const validateCommits = async (): Promise<CommitValidationResult> => {
  console.log(chalk.blue('🔍 Validating commit messages...'));

  const commits = getCommitsSinceLastTag();

  if (commits.length === 0) {
    console.log(chalk.yellow('⚠️ No commits found to validate.'));
    return { isValid: true, errors: [], warnings: [] };
  }

  console.log(chalk.green(`📝 Validating ${commits.length} commits...`));

  const results: ReturnType<typeof validateCommitMessage>[] = [];
  let totalErrors = 0;
  let totalWarnings = 0;

  for (const { hash, message } of commits) {
    const validationResult = validateCommitMessage(message);
    results.push(validationResult);

    const { errors, warnings } = displayCommitValidation(hash, message, validationResult);
    totalErrors += errors;
    totalWarnings += warnings;
  }

  displayValidationSummary(commits, results, totalErrors, totalWarnings);

  const allErrors = results.flatMap((result) => result.errors);
  const allWarnings = results.flatMap((result) => result.warnings);

  displayFinalMessage(totalErrors, totalWarnings);

  return {
    isValid: totalErrors === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
};

// Export for use in other modules
export { validateCommitMessage, parseCommitMessage };
