import { describe, it, expect } from 'vitest';
import { summarizeText, extractKeywords, generateQuestions, generateBullets } from '../services/aiService';

const SAMPLE_TEXT = `
Machine learning is a subset of artificial intelligence that focuses on building systems that learn from data. 
Unlike traditional programming where rules are explicitly defined, machine learning algorithms identify patterns in data.
Deep learning is a specialized form of machine learning that uses neural networks with many layers.
These neural networks are inspired by the structure and function of the human brain.
Applications of machine learning include natural language processing, computer vision, and recommendation systems.
Companies like Google, Amazon, and Microsoft use machine learning extensively in their products.
The field has grown significantly in recent years due to increases in computational power and data availability.
Training machine learning models requires large datasets and significant computational resources.
Supervised learning, unsupervised learning, and reinforcement learning are the three main types of machine learning.
The accuracy of machine learning models depends on the quality and quantity of training data.
`;

describe('summarizeText', () => {
  it('returns a shorter summary than the original', async () => {
    const result = await summarizeText(SAMPLE_TEXT, 0.3);
    expect(result.summaryLength).toBeLessThan(result.originalLength);
  });

  it('returns a valid compression ratio', async () => {
    const result = await summarizeText(SAMPLE_TEXT, 0.3);
    expect(result.compressionRatio).toBeGreaterThan(0);
    expect(result.compressionRatio).toBeLessThan(100);
  });

  it('produces non-empty summary', async () => {
    const result = await summarizeText(SAMPLE_TEXT, 0.3);
    expect(result.summary.length).toBeGreaterThan(0);
  });

  it('respects ratio parameter — lower ratio = shorter summary', async () => {
    const short = await summarizeText(SAMPLE_TEXT, 0.2);
    const long = await summarizeText(SAMPLE_TEXT, 0.8);
    expect(short.summaryLength).toBeLessThanOrEqual(long.summaryLength);
  });
});

describe('extractKeywords', () => {
  it('extracts the requested number of keywords', async () => {
    const result = await extractKeywords(SAMPLE_TEXT, 5);
    expect(result.keywords.length).toBeLessThanOrEqual(5);
    expect(result.keywords.length).toBeGreaterThan(0);
  });

  it('returns keywords with scores', async () => {
    const result = await extractKeywords(SAMPLE_TEXT, 5);
    result.keywords.forEach((k) => {
      expect(k.score).toBeGreaterThan(0);
      expect(k.frequency).toBeGreaterThan(0);
      expect(k.word.length).toBeGreaterThan(0);
    });
  });

  it('filters out stop words', async () => {
    const result = await extractKeywords(SAMPLE_TEXT, 20);
    const stopWords = ['the', 'and', 'is', 'are', 'of', 'in', 'to'];
    result.keywords.forEach((k) => {
      expect(stopWords).not.toContain(k.word);
    });
  });

  it('identifies "learning" and "machine" as top keywords', async () => {
    const result = await extractKeywords(SAMPLE_TEXT, 5);
    const words = result.keywords.map((k) => k.word);
    expect(words).toContain('learning');
    expect(words).toContain('machine');
  });
});

describe('generateQuestions', () => {
  it('generates the requested number of questions', async () => {
    const result = await generateQuestions(SAMPLE_TEXT, 5);
    expect(result.questions.length).toBeLessThanOrEqual(5);
    expect(result.questions.length).toBeGreaterThan(0);
  });

  it('generates strings that end with question marks', async () => {
    const result = await generateQuestions(SAMPLE_TEXT, 3);
    result.questions.forEach((q) => {
      expect(q.endsWith('?')).toBe(true);
    });
  });
});

describe('generateBullets', () => {
  it('generates bullet points', async () => {
    const result = await generateBullets(SAMPLE_TEXT, 5);
    expect(result.bullets.length).toBeGreaterThan(0);
    expect(result.bullets.length).toBeLessThanOrEqual(5);
  });

  it('truncates long bullets to ~100 chars', async () => {
    const result = await generateBullets(SAMPLE_TEXT, 10);
    result.bullets.forEach((b) => {
      expect(b.length).toBeLessThanOrEqual(103); // 100 + "..."
    });
  });

  it('returns count matching actual array length', async () => {
    const result = await generateBullets(SAMPLE_TEXT, 5);
    expect(result.count).toBe(result.bullets.length);
  });
});
