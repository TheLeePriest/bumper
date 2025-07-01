// Main exports for bumper package
export {
  categorizeCommits,
  determineReleaseType,
  generateChangelog,
  getNextVersion,
} from './changelogGenerator.js';
export { createRelease } from './releaseTasks.js';
export { setupProject } from './setup.js';
export {
  parseCommitMessage,
  validateCommitMessage,
  validateCommits,
} from './validateCommits.js';

export {
  formatCommitMessage,
  suggestCommitFormat,
  createInteractiveCommit,
  displayCommitSuggestions,
} from './commitFormatter.js';

export {
  checkReleaseReadiness,
  autoLabelPR,
  setupGitHubIntegration,
  generateEnhancedChangelog,
} from './githubIntegration.js';

// Types
export interface Commit {
  hash: string;
  type: string;
  scope?: string;
  subject: string;
  body?: string;
  breaking?: boolean;
  author: string;
  date: string;
}

export interface ChangelogSection {
  title: string;
  commits: Commit[];
}

export interface ReleaseInfo {
  version: string;
  date: string;
  type: 'major' | 'minor' | 'patch';
  sections: ChangelogSection[];
}

export interface CommitValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ReleaseOptions {
  type: 'patch' | 'minor' | 'major';
  dryRun?: boolean;
}

export interface ReleaseResult {
  success: boolean;
  version: string;
  tag: string;
  changelog: string;
}

export interface SetupOptions {
  force?: boolean;
}

export interface CommitSuggestion {
  original: string;
  suggested: string;
  type: string;
  scope?: string;
  breaking: boolean;
  improvements: string[];
}

export interface GitHubConfig {
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

export interface ReleaseReadinessResult {
  isReady: boolean;
  issues: string[];
  warnings: string[];
  prs: Array<{
    number: number;
    title: string;
    labels: string[];
    status: 'open' | 'closed' | 'merged';
    commits: string[];
  }>;
}
