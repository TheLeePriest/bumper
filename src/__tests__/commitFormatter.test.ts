import { describe, expect, it } from 'vitest';
import { formatCommitMessage, suggestCommitFormat } from '../commitFormatter.js';

describe('Commit Formatter', () => {
  describe('formatCommitMessage', () => {
    it('should format a basic message with suggested type', () => {
      const result = formatCommitMessage('add user authentication');
      expect(result).toBe('feat: Add user authentication');
    });

    it('should format with provided type', () => {
      const result = formatCommitMessage('fix login bug', 'fix');
      expect(result).toBe('fix: Fix login bug');
    });

    it('should format with scope', () => {
      const result = formatCommitMessage('add oauth support', 'feat', 'auth');
      expect(result).toBe('feat(auth): Add oauth support');
    });

    it('should format with breaking change', () => {
      const result = formatCommitMessage('change api response', 'feat', undefined, true);
      expect(result).toBe('feat(api)!: Change api response');
    });

    it('should remove trailing period', () => {
      const result = formatCommitMessage('update docs.');
      expect(result).toBe('docs(docs): Update docs');
    });

    it('should handle empty scope', () => {
      const result = formatCommitMessage('update version', 'chore', '');
      expect(result).toBe('chore: Update version');
    });
  });

  describe('suggestCommitFormat', () => {
    it('should suggest format for invalid message', () => {
      const result = suggestCommitFormat('add new feature');
      expect(result.original).toBe('add new feature');
      expect(result.suggested).toBe('feat: Add new feature');
      expect(result.type).toBe('feat');
      expect(result.improvements).toContain('Convert to conventional commit format');
    });

    it('should recognize existing conventional format', () => {
      const result = suggestCommitFormat('feat(auth): add login');
      expect(result.original).toBe('feat(auth): add login');
      expect(result.suggested).toBe('feat(auth): Add login');
      expect(result.type).toBe('feat');
      expect(result.scope).toBe('auth');
      expect(result.improvements).not.toContain('Convert to conventional commit format');
    });

    it('should detect breaking changes', () => {
      const result = suggestCommitFormat('breaking: change api');
      expect(result.breaking).toBe(true);
      expect(result.suggested).toBe('chore(api)!: Breaking: change api');
    });

    it('should suggest scope from message content', () => {
      const result = suggestCommitFormat('fix auth bug');
      expect(result.scope).toBe('auth');
      expect(result.suggested).toBe('fix(auth): Fix auth bug');
    });

    it('should warn about long messages', () => {
      const longMessage = 'This is a very long commit message that exceeds the recommended length limit of 72 characters';
      const result = suggestCommitFormat(longMessage);
      expect(result.improvements).toContain('Shorten message to under 72 characters');
    });

    it('should warn about trailing periods', () => {
      const result = suggestCommitFormat('update docs.');
      expect(result.improvements).toContain('Remove trailing period');
    });
  });
}); 