import { describe, it, expect, vi, beforeEach } from 'vitest';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {
  checkReleaseReadiness,
  autoLabelPR,
  setupGitHubIntegration,
  generateEnhancedChangelog,
} from '../githubIntegration';

// Mock child_process
vi.mock('node:child_process', () => ({
  execSync: vi.fn(),
}));

// Mock fs
vi.mock('node:fs', () => ({
  default: {
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    mkdirSync: vi.fn(),
  },
}));

// Mock chalk
vi.mock('chalk', () => ({
  default: {
    blue: vi.fn((text: string) => text),
    green: vi.fn((text: string) => text),
    yellow: vi.fn((text: string) => text),
    red: vi.fn((text: string) => text),
    gray: vi.fn((text: string) => text),
  },
}));

describe('GitHub Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkReleaseReadiness', () => {
    it('should return ready when GitHub CLI is not available', () => {
      (execSync as any).mockImplementation(() => {
        throw new Error('gh not found');
      });

      const result = checkReleaseReadiness();

      expect(result.isReady).toBe(true);
      expect(result.warnings).toContain('GitHub CLI not available - skipping GitHub-specific checks');
    });

    it('should check for blocking labels', () => {
      (execSync as any)
        .mockReturnValueOnce('gh version 2.0.0') // gh --version
        .mockReturnValueOnce('v1.0.0') // git describe
        .mockReturnValueOnce(JSON.stringify([
          {
            number: 123,
            title: 'Test PR',
            labels: [{ name: 'do-not-release' }],
            state: 'closed',
            commits: [{ message: 'feat: add feature' }],
          },
        ]));

      const result = checkReleaseReadiness();

      expect(result.isReady).toBe(false);
      expect(result.issues).toContain('PR #123 has blocking label: do-not-release');
    });

    it('should check for required labels when configured', () => {
      (fs.existsSync as any).mockReturnValue(true);
      (fs.readFileSync as any).mockReturnValue(JSON.stringify({
        releaseRequirements: {
          requiredLabels: ['ready-for-release'],
        },
      }));

      (execSync as any)
        .mockReturnValueOnce('gh version 2.0.0') // gh --version
        .mockReturnValueOnce('v1.0.0') // git describe
        .mockReturnValueOnce(JSON.stringify([
          {
            number: 123,
            title: 'Test PR',
            labels: [{ name: 'bug' }],
            state: 'closed',
            commits: [{ message: 'fix: bug fix' }],
          },
        ]));

      const result = checkReleaseReadiness();

      expect(result.isReady).toBe(false);
      expect(result.issues).toContain('PR #123 missing required label (ready-for-release)');
    });
  });

  describe('autoLabelPR', () => {
    it('should not label when auto-labeling is disabled', async () => {
      (fs.existsSync as any).mockReturnValue(true);
      (fs.readFileSync as any).mockReturnValue(JSON.stringify({
        autoLabel: {
          enabled: false,
        },
      }));

      await autoLabelPR(123);

      expect(execSync).not.toHaveBeenCalled();
    });

    it('should add labels based on commit messages', async () => {
      (fs.existsSync as any).mockReturnValue(true);
      (fs.readFileSync as any).mockReturnValue(JSON.stringify({
        autoLabel: {
          enabled: true,
          mappings: {
            feat: ['enhancement'],
            fix: ['bug'],
          },
        },
      }));

      (execSync as any)
        .mockReturnValueOnce('gh version 2.0.0') // gh --version
        .mockReturnValueOnce(JSON.stringify({
          commits: [
            { message: 'feat: add new feature' },
            { message: 'fix: resolve bug' },
          ],
        }))
        .mockReturnValueOnce('') // gh pr edit
        .mockReturnValueOnce(''); // gh pr edit

      await autoLabelPR(123);

      expect(execSync).toHaveBeenCalledWith(
        'gh pr edit 123 --add-label "enhancement"',
        expect.any(Object)
      );
      expect(execSync).toHaveBeenCalledWith(
        'gh pr edit 123 --add-label "bug"',
        expect.any(Object)
      );
    });

    it('should handle conventional commit parsing', async () => {
      (fs.existsSync as any).mockReturnValue(true);
      (fs.readFileSync as any).mockReturnValue(JSON.stringify({
        autoLabel: {
          enabled: true,
          mappings: {
            feat: ['enhancement'],
          },
        },
      }));

      (execSync as any)
        .mockReturnValueOnce('gh version 2.0.0') // gh --version
        .mockReturnValueOnce(JSON.stringify({
          commits: [
            { message: 'feat(ui): add login button' },
            { message: 'fix(auth): resolve token issue' },
          ],
        }))
        .mockReturnValueOnce(''); // gh pr edit

      await autoLabelPR(123);

      expect(execSync).toHaveBeenCalledWith(
        'gh pr edit 123 --add-label "enhancement"',
        expect.any(Object)
      );
    });
  });

  describe('setupGitHubIntegration', () => {
    it('should create configuration file and workflow', async () => {
      (execSync as any).mockReturnValue('gh version 2.0.0');
      (fs.existsSync as any).mockReturnValue(false);

      await setupGitHubIntegration();

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('bumper.config.json'),
        expect.any(String)
      );
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('auto-label.yml'),
        expect.any(String)
      );
    });

    it('should warn when GitHub CLI is not available', async () => {
      (execSync as any).mockImplementation(() => {
        throw new Error('gh not found');
      });

      await setupGitHubIntegration();

      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });
  });

  describe('generateEnhancedChangelog', () => {
    it('should return empty string when label grouping is disabled', () => {
      const result = generateEnhancedChangelog([]);

      expect(result).toBe('');
    });

    it('should generate enhanced content when enabled', () => {
      (fs.existsSync as any).mockReturnValue(true);
      (fs.readFileSync as any).mockReturnValue(JSON.stringify({
        changelog: {
          groupByLabels: true,
          labelGroups: {
            'High Priority': ['high-priority'],
          },
        },
      }));

      const commits = [
        { subject: 'feat: add feature', hash: 'abc123', labels: ['high-priority'] },
      ];

      const result = generateEnhancedChangelog(commits);

      expect(result).toContain('### 🏷️ Label-Based Grouping');
      // Note: The current implementation doesn't actually group commits yet
      // This test verifies the structure is created
    });
  });

  describe('Configuration Loading', () => {
    it('should use default config when no file exists', () => {
      (fs.existsSync as any).mockReturnValue(false);

      const result = checkReleaseReadiness();

      expect(result.isReady).toBe(true);
    });

    it('should merge user config with defaults', () => {
      (fs.existsSync as any).mockReturnValue(true);
      (fs.readFileSync as any).mockReturnValue(JSON.stringify({
        releaseRequirements: {
          blockingLabels: ['custom-block'],
        },
      }));

      (execSync as any)
        .mockReturnValueOnce('gh version 2.0.0') // gh --version
        .mockReturnValueOnce('v1.0.0') // git describe
        .mockReturnValueOnce(JSON.stringify([
          {
            number: 123,
            title: 'Test PR',
            labels: [{ name: 'custom-block' }],
            state: 'closed',
            commits: [{ message: 'feat: add feature' }],
          },
        ]));

      const result = checkReleaseReadiness();

      expect(result.isReady).toBe(false);
      expect(result.issues).toContain('PR #123 has blocking label: custom-block');
    });

    it('should handle invalid JSON gracefully', () => {
      (fs.existsSync as any).mockReturnValue(true);
      (fs.readFileSync as any).mockReturnValue('invalid json');

      const result = checkReleaseReadiness();

      expect(result.isReady).toBe(true);
    });
  });
}); 