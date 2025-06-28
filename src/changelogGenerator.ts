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
function parseCommitMessage(message: string): Partial<Commit> {
  const conventionalCommitRegex = /^(\w+)(?:\(([\w-]+)\))?(!)?:\s(.+)$/;
  const match = message.match(conventionalCommitRegex);

  if (!match) {
    return { type: 'chore', subject: message };
  }

  const [, commitType, commitScope, isBreaking, commitSubject] = match;
  return {
    type: commitType || 'chore',
    scope: commitScope || undefined,
    breaking: !!isBreaking,
    subject: commitSubject || message,
  };
}

// Get commits since last tag
function getCommitsSinceLastTag(): Commit[] {
  try {
    const lastTag = execSync('git describe --tags --abbrev=0', {
      encoding: 'utf8',
    }).trim();
    const commits = execSync(
      `git log --pretty=format:"%H|%s|%an|%ad" --date=short ${lastTag}..HEAD`,
      { encoding: 'utf8' }
    ).trim();

    if (!commits) return [];

    return commits.split('\n').map((commitLine) => {
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
    });
  } catch {
    // If no tags exist, get all commits
    const commits = execSync('git log --pretty=format:"%H|%s|%an|%ad" --date=short', {
      encoding: 'utf8',
    }).trim();

    if (!commits) return [];

    return commits.split('\n').map((commitLine) => {
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
    });
  }
}

// Categorize commits into sections
function categorizeCommits(commits: Commit[]): ChangelogSection[] {
  const sections = new Map<string, Commit[]>();

  for (const commit of commits) {
    const typeInfo = COMMIT_TYPES[commit.type as keyof typeof COMMIT_TYPES];
    const sectionKey = typeInfo ? `${typeInfo.emoji} ${typeInfo.title}` : '🔧 Other Changes';

    if (!sections.has(sectionKey)) {
      sections.set(sectionKey, []);
    }
    sections.get(sectionKey)?.push(commit);
  }

  return Array.from(sections.entries()).map(([sectionTitle, sectionCommits]) => ({
    title: sectionTitle,
    commits: sectionCommits.sort(
      (firstCommit, secondCommit) =>
        new Date(secondCommit.date).getTime() - new Date(firstCommit.date).getTime()
    ),
  }));
}

// Generate changelog content
function generateChangelogContent(releaseInfo: ReleaseInfo): string {
  const { version, date, type, sections } = releaseInfo;

  let content = `## [${version}] - ${date} (${type.toUpperCase()} RELEASE)\n\n`;

  // Add breaking changes first if any
  const breakingChanges = sections.flatMap((section) =>
    section.commits.filter((commit) => commit.breaking)
  );

  if (breakingChanges.length > 0) {
    content += '### ⚠️ BREAKING CHANGES\n\n';
    for (const breakingCommit of breakingChanges) {
      content += `- **${breakingCommit.scope ? `${breakingCommit.scope}: ` : ''}${
        breakingCommit.subject
      }** (${breakingCommit.hash})\n`;
    }
    content += '\n';
  }

  // Add categorized sections
  for (const section of sections) {
    if (section.commits.length === 0) continue;

    content += `### ${section.title}\n\n`;
    for (const sectionCommit of section.commits) {
      const scope = sectionCommit.scope ? `**${sectionCommit.scope}:** ` : '';
      content += `- ${scope}${sectionCommit.subject} (${sectionCommit.hash})\n`;
    }
    content += '\n';
  }

  // Add contributors section
  const contributors = new Set(
    sections.flatMap((section) => section.commits.map((commit) => commit.author))
  );

  if (contributors.size > 0) {
    content += '### 👥 Contributors\n\n';
    content += `Thanks to ${Array.from(contributors).join(
      ', '
    )} for contributing to this release!\n\n`;
  }

  return content;
}

// Determine release type based on commits
function determineReleaseType(commits: Commit[]): 'major' | 'minor' | 'patch' {
  const hasBreakingChanges = commits.some((commit) => commit.breaking);
  const hasFeatures = commits.some((commit) => commit.type === 'feat');

  if (hasBreakingChanges) return 'major';
  if (hasFeatures) return 'minor';
  return 'patch';
}

// Get next version
function getNextVersion(currentVersion: string, releaseType: 'major' | 'minor' | 'patch'): string {
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
}

// Main function
export async function generateChangelog(options: { preview: boolean }) {
  const { preview } = options;
  const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');

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
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const currentVersion = packageJson.version;
  const nextVersion = getNextVersion(currentVersion, releaseType);

  const releaseInfo: ReleaseInfo = {
    version: nextVersion,
    date: new Date().toISOString().split('T')[0] || new Date().toISOString().slice(0, 10),
    type: releaseType,
    sections,
  };

  const changelogContent = generateChangelogContent(releaseInfo);

  if (preview) {
    console.log('\n📋 CHANGELOG PREVIEW:');
    console.log('='.repeat(50));
    console.log(changelogContent);
    console.log('='.repeat(50));
    console.log(`\n🎯 Release Type: ${chalk.cyan(releaseType.toUpperCase())}`);
    console.log(`📦 Version: ${chalk.yellow(currentVersion)} → ${chalk.green(nextVersion)}`);
    console.log('📊 Commit Summary:');
    for (const section of sections) {
      console.log(`  ${section.title}: ${chalk.blue(section.commits.length)} commits`);
    }
  } else {
    // Update or create CHANGELOG.md
    let existingContent = '';
    if (fs.existsSync(changelogPath)) {
      existingContent = fs.readFileSync(changelogPath, 'utf8');
    } else {
      existingContent =
        '# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n';
    }

    const newContent = existingContent + changelogContent;
    fs.writeFileSync(changelogPath, newContent);

    console.log(chalk.green('✅ Changelog updated successfully!'));
    console.log(`📦 Next version will be: ${chalk.green(nextVersion)}`);
    console.log(`🎯 Release type: ${chalk.cyan(releaseType.toUpperCase())}`);
  }
}

// Export functions for use in other modules
export { categorizeCommits, determineReleaseType, getNextVersion };
