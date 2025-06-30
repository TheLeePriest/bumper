#!/usr/bin/env node

import chalk from 'chalk';
import inquirer from 'inquirer';

// Conventional commit types and their descriptions
const COMMIT_TYPES = {
  feat: { emoji: '✨', description: 'A new feature' },
  fix: { emoji: '🐛', description: 'A bug fix' },
  docs: { emoji: '📚', description: 'Documentation only changes' },
  style: { emoji: '💄', description: 'Changes that do not affect the meaning of the code' },
  refactor: { emoji: '♻️', description: 'A code change that neither fixes a bug nor adds a feature' },
  perf: { emoji: '⚡', description: 'A code change that improves performance' },
  test: { emoji: '✅', description: 'Adding missing tests or correcting existing tests' },
  build: { emoji: '📦', description: 'Changes that affect the build system or external dependencies' },
  ci: { emoji: '🔧', description: 'Changes to our CI configuration files and scripts' },
  chore: { emoji: '🔨', description: 'Other changes that do not modify src or test files' },
  revert: { emoji: '⏪', description: 'Reverts a previous commit' },
  security: { emoji: '🔒', description: 'Security fixes' },
} as const;

// Common scope suggestions based on common project structures
const COMMON_SCOPES = [
  'auth',
  'api',
  'ui',
  'cli',
  'docs',
  'test',
  'build',
  'ci',
  'deps',
  'config',
  'types',
  'utils',
  'core',
  'server',
  'client',
  'database',
  'cache',
  'logging',
  'monitoring',
  'security',
];

// Keywords that suggest commit types
const TYPE_KEYWORDS = {
  feat: ['add', 'new', 'create', 'implement', 'introduce', 'support', 'enable', 'allow'],
  fix: ['fix', 'resolve', 'repair', 'correct', 'solve', 'patch', 'bug', 'issue', 'error'],
  docs: ['document', 'readme', 'docs', 'comment', 'example', 'guide', 'tutorial'],
  style: ['style', 'format', 'indent', 'whitespace', 'prettier', 'eslint'],
  refactor: ['refactor', 'restructure', 'reorganize', 'cleanup', 'simplify', 'extract'],
  perf: ['performance', 'optimize', 'speed', 'fast', 'slow', 'cache'],
  test: ['test', 'spec', 'coverage', 'mock', 'stub', 'fixture'],
  build: ['build', 'compile', 'bundle', 'webpack', 'rollup', 'dependencies'],
  ci: ['ci', 'github', 'actions', 'workflow', 'pipeline', 'deploy'],
  chore: ['chore', 'maintenance', 'update', 'upgrade', 'bump', 'version'],
  revert: ['revert', 'undo', 'rollback', 'backout'],
  security: ['security', 'vulnerability', 'cve', 'auth', 'permission', 'access'],
};

// Suggest commit type based on message content
const suggestCommitType = (message: string): string => {
  const lowerMessage = message.toLowerCase();
  
  for (const [type, keywords] of Object.entries(TYPE_KEYWORDS)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      return type;
    }
  }
  
  return 'chore'; // Default fallback
};

// Suggest scope based on message content and common patterns
const suggestScope = (message: string): string | undefined => {
  const lowerMessage = message.toLowerCase();
  
  // Check for parentheses patterns like "fix (auth): ..." first
  const scopeMatch = message.match(/\(([^)]+)\)/);
  if (scopeMatch) {
    return scopeMatch[1];
  }
  
  // Only suggest scope if it's a clear match (exact word boundaries)
  for (const scope of COMMON_SCOPES) {
    const scopeRegex = new RegExp(`\\b${scope}\\b`, 'i');
    if (scopeRegex.test(lowerMessage)) {
      return scope;
    }
  }
  
  return undefined;
};

// Clean and format a message
const cleanMessage = (message: string): string => {
  let clean = message.trim();
  
  // Remove trailing period
  if (clean.endsWith('.')) {
    clean = clean.slice(0, -1);
  }
  
  // Convert to lowercase then capitalize first letter
  clean = clean.toLowerCase();
  clean = clean.charAt(0).toUpperCase() + clean.slice(1);
  
  return clean;
};

// Format a message into conventional commit format
export const formatCommitMessage = (
  message: string,
  type?: string,
  scope?: string,
  breaking = false
): string => {
  const cleanMsg = cleanMessage(message);
  const suggestedType = type || suggestCommitType(message);
  const suggestedScope = scope || suggestScope(message);
  
  let formatted = suggestedType;
  
  if (suggestedScope) {
    formatted += `(${suggestedScope})`;
  }
  
  if (breaking) {
    formatted += '!';
  }
  
  formatted += `: ${cleanMsg}`;
  
  return formatted;
};

// Check if message is already in conventional format
const isConventionalFormat = (message: string): boolean => {
  const conventionalRegex = /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert|security)(\([\w-]+\))?(!)?:\s(.+)$/;
  return conventionalRegex.test(message);
};

// Parse existing conventional commit
const parseConventionalCommit = (message: string) => {
  const conventionalRegex = /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert|security)(\([\w-]+\))?(!)?:\s(.+)$/;
  const match = message.match(conventionalRegex);
  
  if (!match) return null;
  
  const [, type, scope, isBreaking, subject] = match;
  return {
    type: type || 'chore',
    scope: scope ? scope.slice(1, -1) : undefined,
    breaking: !!isBreaking,
    subject: subject?.trim() || '',
  };
};

// Generate improvements for a commit message
const generateImprovements = (message: string): string[] => {
  const improvements: string[] = [];
  
  if (!isConventionalFormat(message)) {
    improvements.push('Convert to conventional commit format');
  }
  
  if (message.toLowerCase().includes('breaking') || message.includes('!')) {
    improvements.push('Mark as breaking change');
  }
  
  if (message.length > 72) {
    improvements.push('Shorten message to under 72 characters');
  }
  
  if (message.endsWith('.')) {
    improvements.push('Remove trailing period');
  }
  
  return improvements;
};

// Suggest improvements for an existing commit message
export const suggestCommitFormat = (message: string): {
  original: string;
  suggested: string;
  type: string;
  scope?: string;
  breaking: boolean;
  improvements: string[];
} => {
  const improvements = generateImprovements(message);
  let type = suggestCommitType(message);
  let scope = suggestScope(message);
  let breaking = false;
  
  // Check if it's already in conventional format
  if (isConventionalFormat(message)) {
    const parsed = parseConventionalCommit(message);
    if (parsed) {
      type = parsed.type;
      scope = parsed.scope;
      breaking = parsed.breaking;
      
      // For existing conventional commits, just clean up the subject
      let cleanSubject = parsed.subject;
      if (cleanSubject.endsWith('.')) {
        cleanSubject = cleanSubject.slice(0, -1);
        improvements.push('Remove trailing period');
      }
      
      // Capitalize first letter
      cleanSubject = cleanSubject.charAt(0).toLowerCase() + cleanSubject.slice(1);
      cleanSubject = cleanSubject.charAt(0).toUpperCase() + cleanSubject.slice(1);
      
      let suggested = type;
      if (scope) {
        suggested += `(${scope})`;
      }
      if (breaking) {
        suggested += '!';
      }
      suggested += `: ${cleanSubject}`;
      
      return {
        original: message,
        suggested,
        type,
        scope,
        breaking,
        improvements,
      };
    }
  }
  
  // Check for breaking change indicators
  if (message.toLowerCase().includes('breaking') || message.includes('!')) {
    breaking = true;
  }
  
  const suggested = formatCommitMessage(message, type, scope, breaking);
  
  return {
    original: message,
    suggested,
    type,
    scope,
    breaking,
    improvements,
  };
};

// Create type choices for interactive prompts
const createTypeChoices = () => 
  Object.entries(COMMIT_TYPES).map(([value, info]) => ({
    name: `${info.emoji} ${value}: ${info.description}`,
    value,
  }));

// Validate description input
const validateDescription = (input: string): true | string => {
  if (!input.trim()) {
    return 'Description is required';
  }
  if (input.length > 72) {
    return 'Description should be under 72 characters';
  }
  return true;
};

// Interactive commit creation
export const createInteractiveCommit = async (): Promise<string> => {
  console.log(chalk.blue('🎯 Creating a conventional commit...\n'));
  
  // Get commit type
  const { type } = await inquirer.prompt([
    {
      type: 'list',
      name: 'type',
      message: 'What type of change is this?',
      choices: createTypeChoices(),
    },
  ]);
  
  // Get scope (optional)
  const { scope } = await inquirer.prompt([
    {
      type: 'input',
      name: 'scope',
      message: 'What is the scope of this change? (optional)',
      default: '',
    },
  ]);
  
  // Get breaking change
  const { breaking } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'breaking',
      message: 'Is this a breaking change?',
      default: false,
    },
  ]);
  
  // Get description
  const { description } = await inquirer.prompt([
    {
      type: 'input',
      name: 'description',
      message: 'Write a short description of the change:',
      validate: validateDescription,
    },
  ]);
  
  // Get body (optional)
  const { body } = await inquirer.prompt([
    {
      type: 'input',
      name: 'body',
      message: 'Write a longer description (optional):',
      default: '',
    },
  ]);
  
  // Build the commit message
  let commitMessage = formatCommitMessage(description, type, scope || undefined, breaking);
  
  if (body.trim()) {
    commitMessage += `\n\n${body.trim()}`;
  }
  
  return commitMessage;
};

// Display commit format suggestions
export const displayCommitSuggestions = (message: string): void => {
  const suggestion = suggestCommitFormat(message);
  
  console.log(chalk.blue('💡 Commit Message Suggestions\n'));
  console.log(chalk.gray('Original:'), suggestion.original);
  console.log(chalk.green('Suggested:'), suggestion.suggested);
  
  if (suggestion.improvements.length > 0) {
    console.log(chalk.yellow('\nImprovements:'));
    for (const improvement of suggestion.improvements) {
      console.log(chalk.yellow(`  • ${improvement}`));
    }
  }
  
  console.log(chalk.blue('\nType:'), suggestion.type);
  if (suggestion.scope) {
    console.log(chalk.blue('Scope:'), suggestion.scope);
  }
  if (suggestion.breaking) {
    console.log(chalk.red('Breaking:'), 'Yes');
  }
}; 