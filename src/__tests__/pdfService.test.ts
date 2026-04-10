import { describe, it, expect } from 'vitest';
import { parsePageRange } from '../services/pdfService';

describe('parsePageRange', () => {
  it('parses single page numbers', () => {
    expect(parsePageRange('3', 10)).toEqual([3]);
  });

  it('parses comma-separated pages', () => {
    expect(parsePageRange('1, 3, 5', 10)).toEqual([1, 3, 5]);
  });

  it('parses ranges', () => {
    expect(parsePageRange('2-5', 10)).toEqual([2, 3, 4, 5]);
  });

  it('parses mixed ranges and singles', () => {
    expect(parsePageRange('1-3, 5, 7-9', 10)).toEqual([1, 2, 3, 5, 7, 8, 9]);
  });

  it('deduplicates overlapping ranges', () => {
    expect(parsePageRange('1-5, 3-7', 10)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('clamps to max page count', () => {
    expect(parsePageRange('1-100', 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it('ignores pages below 1', () => {
    expect(parsePageRange('0, -1, 1', 10)).toEqual([1]);
  });

  it('returns sorted results', () => {
    expect(parsePageRange('5, 2, 8, 1', 10)).toEqual([1, 2, 5, 8]);
  });

  it('returns empty for invalid input', () => {
    expect(parsePageRange('abc, xyz', 10)).toEqual([]);
  });

  it('handles whitespace gracefully', () => {
    expect(parsePageRange('  1 - 3 , 5 ', 10)).toEqual([1, 2, 3, 5]);
  });
});
