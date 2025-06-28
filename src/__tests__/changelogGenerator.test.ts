import { beforeEach, describe, expect, it, vi } from 'vitest';
import { determineReleaseType, getNextVersion } from '../changelogGenerator.js';

// Import the Commit interface
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

describe('Changelog Generator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('determineReleaseType', () => {
    it('should return major for breaking changes', () => {
      const commits: Commit[] = [{ 
        hash: 'a1b2c3d4', 
        type: 'feat', 
        breaking: true, 
        subject: 'breaking change',
        author: 'test',
        date: '2024-01-01'
      }];
      expect(determineReleaseType(commits)).toBe('major');
    });

    it('should return minor for features', () => {
      const commits: Commit[] = [{ 
        hash: 'e5f6g7h8', 
        type: 'feat', 
        breaking: false, 
        subject: 'new feature',
        author: 'test',
        date: '2024-01-01'
      }];
      expect(determineReleaseType(commits)).toBe('minor');
    });

    it('should return patch for fixes', () => {
      const commits: Commit[] = [{ 
        hash: 'i9j0k1l2', 
        type: 'fix', 
        breaking: false, 
        subject: 'bug fix',
        author: 'test',
        date: '2024-01-01'
      }];
      expect(determineReleaseType(commits)).toBe('patch');
    });
  });

  describe('getNextVersion', () => {
    it('should increment major version', () => {
      expect(getNextVersion('1.0.0', 'major')).toBe('2.0.0');
      expect(getNextVersion('2.1.3', 'major')).toBe('3.0.0');
    });

    it('should increment minor version', () => {
      expect(getNextVersion('1.0.0', 'minor')).toBe('1.1.0');
      expect(getNextVersion('2.1.3', 'minor')).toBe('2.2.0');
    });

    it('should increment patch version', () => {
      expect(getNextVersion('1.0.0', 'patch')).toBe('1.0.1');
      expect(getNextVersion('2.1.3', 'patch')).toBe('2.1.4');
    });
  });
});
