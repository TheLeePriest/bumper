import { describe, expect, it } from 'vitest';
import { parseCommitMessage, validateCommitMessage } from '../validateCommits.js';

describe('Commit Validation', () => {
  describe('validateCommitMessage', () => {
    it('should validate correct conventional commit', () => {
      const result = validateCommitMessage('feat: add new feature');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate commit with scope', () => {
      const result = validateCommitMessage('feat(auth): add login functionality');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate breaking change', () => {
      const result = validateCommitMessage('feat!: breaking change');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid commit format', () => {
      const result = validateCommitMessage('invalid commit message');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Commit message does not follow conventional commit format');
    });

    it('should warn for long commit messages', () => {
      const longMessage = `feat: ${'a'.repeat(80)}`;
      const result = validateCommitMessage(longMessage);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Commit message is longer than 72 characters');
    });
  });

  describe('parseCommitMessage', () => {
    it('should parse valid commit message', () => {
      const result = parseCommitMessage('feat(auth): add login');
      expect(result.type).toBe('feat');
      expect(result.scope).toBe('auth');
      expect(result.breaking).toBe(false);
      expect(result.subject).toBe('add login');
    });

    it('should parse breaking change', () => {
      const result = parseCommitMessage('feat!: breaking change');
      expect(result.type).toBe('feat');
      expect(result.breaking).toBe(true);
      expect(result.subject).toBe('breaking change');
    });

    it('should handle invalid format', () => {
      const result = parseCommitMessage('invalid message');
      expect(result.type).toBe('invalid');
      expect(result.breaking).toBe(false);
      expect(result.subject).toBe('invalid message');
    });
  });
});
