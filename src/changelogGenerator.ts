#!/usr/bin/env node

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';

interface Commit {
  hash: string;
  type: string;
  scope?: string;
  subject: string;
  body?: string;
  breaking?: boolean;
  author: string;
  date: string;
}

interface ChangelogSection {
  title: string;
  commits: Commit[];
}

interface ReleaseInfo {
  version: string;
  date: string;
  type: 'major' | 'minor' | 'patch';
  sections: ChangelogSection[];
}

// Conventional commit types and their emojis
const COMMIT_TYPES = {
  feat: { emoji: '✨', title: 'Features' },
  fix: { emoji: '🐛', title: 'Bug Fixes' },
  docs: { emoji: '📚', title: 'Documentation' },
  style: { emoji: '💄', title: 'Styles' },
  refactor: { emoji: '♻️', title: 'Code Refactoring' },
  perf: { emoji: '⚡', title: 'Performance Improvements' },
  test: { emoji: '✅', title: 'Tests' },
  build: { emoji: '📦', title: 'Builds' },
  ci: { emoji: '🔧', title: 'Continuous Integration' },
  chore: { emoji: '🔨', title: 'Chores' },
  revert: { emoji: '⏪', title: 'Reverts' },
  security: { emoji: '🔒', title: 'Security Fixes' },
} as const;

// Parse conventional commit message
const parseCommitMessage = (message: string): Partial<Commit> => {
  const conventionalCommitRegex = /^(\w+)(?:\(([\w-]+)\))?(!)?:\s(.+)$/;
  const match = message.match(conventionalCommitRegex);

  if (!match) {
    // Try to infer type from legacy commit message
    const words = message.toLowerCase().split(/\s+/);
    const firstWord = words[0];
    
    let inferredType = 'chore';
    if (['add', 'new', 'create', 'implement'].includes(firstWord || '')) {
      inferredType = 'feat';
    } else if (['fix', 'bug', 'issue', 'problem'].includes(firstWord || '')) {
      inferredType = 'fix';
    } else if (['update', 'upgrade', 'bump'].includes(firstWord || '')) {
      inferredType = 'chore';
    } else if (['refactor', 'clean', 'improve'].includes(firstWord || '')) {
      inferredType = 'refactor';
    } else if (['test', 'spec'].includes(firstWord || '')) {
      inferredType = 'test';
    } else if (['doc', 'readme', 'comment'].includes(firstWord || '')) {
      inferredType = 'docs';
    }
    
    return { type: inferredType, subject: message };
  }

  const [, commitType, commitScope, isBreaking, commitSubject] = match;
  return {
    type: commitType || 'chore',
    scope: commitScope || undefined,
    breaking: !!isBreaking,
    subject: commitSubject || message,
  };
};

// Parse commit line from git log
const parseCommitLine = (commitLine: string): Commit => {
  const commitParts = commitLine.split('|');
  const commitHash = commitParts[0] || '';
  const commitMessage = commitParts[1] || '';
  const commitAuthor = commitParts[2] || '';
  const commitDate = commitParts[3] || '';

  const parsed = parseCommitMessage(commitMessage);

  return {
    hash: commitHash.substring(0, 8),
    type: parsed.type || 'chore',
    scope: parsed.scope,
    subject: parsed.subject || commitMessage,
    breaking: parsed.breaking,
    author: commitAuthor,
    date: commitDate,
  };
};

// Get commits from git log
const getCommitsFromGitLog = (range?: string): Commit[] => {
  const command = range
    ? `git log --pretty=format:"%H|%s|%an|%ad" --date=short ${range}`
    : 'git log --pretty=format:"%H|%s|%an|%ad" --date=short';
    
  const commits = execSync(command, { encoding: 'utf8' }).trim();
  
  if (!commits) return [];
  
  return commits.split('\n').map(parseCommitLine);
};

// Get commits since last tag
const getCommitsSinceLastTag = (): Commit[] => {
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

// Check if there's a line in the sand marker
const getLineInSandPoint = (): string | null => {
  try {
    // Check for conventional commits start tag
    const tags = execSync('git tag --list "conventional-commits-start-*"', {
      encoding: 'utf8',
    }).trim();
    
    if (tags) {
      const tagLines = tags.split('\n').filter(tag => tag.trim());
      if (tagLines.length > 0) {
        // Get the most recent tag
        const latestTag = tagLines[tagLines.length - 1];
        return latestTag || null;
      }
    }
    
    // Check for marker file
    if (fs.existsSync('.conventional-commits-start')) {
      // Try to find the commit where this file was added
      const markerCommit = execSync('git log --oneline --follow -- .conventional-commits-start | head -1', {
        encoding: 'utf8',
      }).trim();
      
      if (markerCommit) {
        const commitHash = markerCommit.split(' ')[0];
        return commitHash || null;
      }
    }
    
    return null;
  } catch {
    return null;
  }
};

// Get commits since line in the sand
const getCommitsSinceLineInSand = (): Commit[] => {
  const lineInSandPoint = getLineInSandPoint();
  
  if (lineInSandPoint) {
    console.log(chalk.blue(`📅 Using line in the sand: ${lineInSandPoint}`));
    return getCommitsFromGitLog(`${lineInSandPoint}..HEAD`);
  }
  
  return getCommitsFromGitLog();
};

// Get section key for commit type
const getSectionKey = (commitType: string): string => {
  const typeInfo = COMMIT_TYPES[commitType as keyof typeof COMMIT_TYPES];
  return typeInfo ? `${typeInfo.emoji} ${typeInfo.title}` : '🔧 Other Changes';
};

// Sort commits by date (newest first)
const sortCommitsByDate = (commits: Commit[]): Commit[] =>
  commits.sort(
    (firstCommit, secondCommit) =>
      new Date(secondCommit.date).getTime() - new Date(firstCommit.date).getTime()
  );

// Categorize commits into sections
const categorizeCommits = (commits: Commit[]): ChangelogSection[] => {
  const sections = new Map<string, Commit[]>();

  for (const commit of commits) {
    const sectionKey = getSectionKey(commit.type);

    if (!sections.has(sectionKey)) {
      sections.set(sectionKey, []);
    }
    sections.get(sectionKey)?.push(commit);
  }

  return Array.from(sections.entries()).map(([sectionTitle, sectionCommits]) => ({
    title: sectionTitle,
    commits: sortCommitsByDate(sectionCommits),
  }));
};

// Generate breaking changes section
const generateBreakingChangesSection = (sections: ChangelogSection[]): string => {
  const breakingChanges = sections.flatMap((section) =>
    section.commits.filter((commit) => commit.breaking)
  );

  if (breakingChanges.length === 0) return '';

  let content = '### ⚠️ BREAKING CHANGES\n\n';
  for (const breakingCommit of breakingChanges) {
    content += `- **${breakingCommit.scope ? `${breakingCommit.scope}: ` : ''}${
      breakingCommit.subject
    }** (${breakingCommit.hash})\n`;
  }
  content += '\n';

  return content;
};

// Generate section content
const generateSectionContent = (section: ChangelogSection): string => {
  if (section.commits.length === 0) return '';

  let content = `### ${section.title}\n\n`;
  for (const sectionCommit of section.commits) {
    const scope = sectionCommit.scope ? `**${sectionCommit.scope}:** ` : '';
    content += `- ${scope}${sectionCommit.subject} (${sectionCommit.hash})\n`;
  }
  content += '\n';

  return content;
};

// Generate contributors section
const generateContributorsSection = (sections: ChangelogSection[]): string => {
  const contributors = new Set(
    sections.flatMap((section) => section.commits.map((commit) => commit.author))
  );

  if (contributors.size === 0) return '';

  let content = '### 👥 Contributors\n\n';
  content += `Thanks to ${Array.from(contributors).join(', ')} for contributing to this release!\n\n`;

  return content;
};

// Generate changelog content
const generateChangelogContent = (releaseInfo: ReleaseInfo): string => {
  const { version, date, type, sections } = releaseInfo;

  let content = `## [${version}] - ${date} (${type.toUpperCase()} RELEASE)\n\n`;

  // Add breaking changes first if any
  content += generateBreakingChangesSection(sections);

  // Add categorized sections
  for (const section of sections) {
    content += generateSectionContent(section);
  }

  // Add contributors section
  content += generateContributorsSection(sections);

  return content;
};

// Determine release type based on commits
const determineReleaseType = (commits: Commit[]): 'major' | 'minor' | 'patch' => {
  const hasBreakingChanges = commits.some((commit) => commit.breaking);
  const hasFeatures = commits.some((commit) => commit.type === 'feat');

  if (hasBreakingChanges) return 'major';
  if (hasFeatures) return 'minor';
  return 'patch';
};

// Get next version
const getNextVersion = (currentVersion: string, releaseType: 'major' | 'minor' | 'patch'): string => {
  const versionParts = currentVersion.split('.').map(Number);
  const major = versionParts[0] || 0;
  const minor = versionParts[1] || 0;
  const patch = versionParts[2] || 0;

  switch (releaseType) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
  }
};

// Read package.json
const readPackageJson = () => {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  return JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
};

// Get current date
const getCurrentDate = (): string => {
  return new Date().toISOString().split('T')[0] || new Date().toISOString().slice(0, 10);
};

// Display preview information
const displayPreview = (releaseInfo: ReleaseInfo, currentVersion: string, sections: ChangelogSection[]): void => {
  console.log('\n📋 CHANGELOG PREVIEW:');
  console.log('='.repeat(50));
  console.log(generateChangelogContent(releaseInfo));
  console.log('='.repeat(50));
  console.log(`\n🎯 Release Type: ${chalk.cyan(releaseInfo.type.toUpperCase())}`);
  console.log(`📦 Version: ${chalk.yellow(currentVersion)} → ${chalk.green(releaseInfo.version)}`);
  console.log('📊 Commit Summary:');
  for (const section of sections) {
    console.log(`  ${section.title}: ${chalk.blue(section.commits.length)} commits`);
  }
};

// Update changelog file
const updateChangelogFile = (changelogContent: string): void => {
  const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
  
  let existingContent = '';
  if (fs.existsSync(changelogPath)) {
    existingContent = fs.readFileSync(changelogPath, 'utf8');
  } else {
    existingContent =
      '# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n';
  }

  const newContent = existingContent + changelogContent;
  fs.writeFileSync(changelogPath, newContent);
};

// Main function
export const generateChangelog = async (options: { preview: boolean }) => {
  const { preview } = options;

  console.log(chalk.blue('🔍 Analyzing commits...'));

  const commits = getCommitsSinceLastTag();

  if (commits.length === 0) {
    console.log(chalk.yellow('⚠️ No new commits found since last release.'));
    return;
  }

  console.log(chalk.green(`📝 Found ${commits.length} commits since last release`));

  const releaseType = determineReleaseType(commits);
  const sections = categorizeCommits(commits);

  // Read current version from package.json
  const packageJson = readPackageJson();
  const currentVersion = packageJson.version;
  const nextVersion = getNextVersion(currentVersion, releaseType);

  const releaseInfo: ReleaseInfo = {
    version: nextVersion,
    date: getCurrentDate(),
    type: releaseType,
    sections,
  };

  if (preview) {
    displayPreview(releaseInfo, currentVersion, sections);
  } else {
    // Update or create CHANGELOG.md
    updateChangelogFile(generateChangelogContent(releaseInfo));

    console.log(chalk.green('✅ Changelog updated successfully!'));
    console.log(`📦 Next version will be: ${chalk.green(nextVersion)}`);
    console.log(`🎯 Release type: ${chalk.cyan(releaseType.toUpperCase())}`);
  }
};

// Export functions for use in other modules
export { categorizeCommits, determineReleaseType, getNextVersion };
