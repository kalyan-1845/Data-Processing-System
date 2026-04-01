// AI Service - Rule-based text processing (client-side implementation)
// Uses NLP techniques for summarization, keyword extraction, question generation, and bullet point creation

export interface SummaryResult {
  summary: string;
  originalLength: number;
  summaryLength: number;
  compressionRatio: number;
}

export interface KeywordResult {
  keywords: { word: string; score: number; frequency: number }[];
  totalWords: number;
}

export interface QuestionResult {
  questions: string[];
  count: number;
}

export interface BulletResult {
  bullets: string[];
  count: number;
}

// Stop words for filtering
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
  'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does',
  'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need',
  'it', 'its', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'we', 'they', 'me',
  'him', 'her', 'us', 'them', 'my', 'your', 'his', 'our', 'their', 'what', 'which', 'who',
  'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other',
  'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
  'just', 'also', 'now', 'here', 'there', 'then', 'once', 'if', 'because', 'about', 'into',
  'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'again',
]);

// Helper: Split text into sentences
function splitSentences(text: string): string[] {
  return text
    .replace(/([.!?])\s+/g, '$1|')
    .split('|')
    .map((s) => s.trim())
    .filter((s) => s.length > 10);
}

// Helper: Calculate word frequency
function getWordFrequency(text: string): Map<string, number> {
  const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
  const freq = new Map<string, number>();
  words.forEach((word) => {
    if (!STOP_WORDS.has(word)) {
      freq.set(word, (freq.get(word) || 0) + 1);
    }
  });
  return freq;
}

// Helper: Score sentences based on word importance
function scoreSentence(sentence: string, wordFreq: Map<string, number>): number {
  const words = sentence.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
  if (words.length === 0) return 0;
  
  let score = 0;
  words.forEach((word) => {
    score += wordFreq.get(word) || 0;
  });
  
  // Normalize by sentence length (with penalty for very long sentences)
  return score / Math.sqrt(words.length);
}

// AI Summarization using extractive summarization
export async function summarizeText(text: string, ratio: number = 0.3): Promise<SummaryResult> {
  const sentences = splitSentences(text);
  const wordFreq = getWordFrequency(text);
  
  // Score each sentence
  const scoredSentences = sentences.map((sentence, index) => ({
    sentence,
    index,
    score: scoreSentence(sentence, wordFreq),
  }));
  
  // Sort by score and select top sentences
  const numSentences = Math.max(1, Math.ceil(sentences.length * ratio));
  const topSentences = scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, numSentences)
    .sort((a, b) => a.index - b.index);
  
  const summary = topSentences.map((s) => s.sentence).join(' ');
  
  return {
    summary,
    originalLength: text.length,
    summaryLength: summary.length,
    compressionRatio: Math.round((1 - summary.length / text.length) * 100),
  };
}

// AI Keyword Extraction using TF-IDF-like scoring
export async function extractKeywords(text: string, count: number = 10): Promise<KeywordResult> {
  const wordFreq = getWordFrequency(text);
  const totalWords = (text.toLowerCase().match(/\b[a-z]{3,}\b/g) || []).length;
  
  // Calculate scores
  const keywords = Array.from(wordFreq.entries())
    .map(([word, frequency]) => ({
      word,
      frequency,
      score: frequency * Math.log(totalWords / frequency + 1),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count);
  
  // Normalize scores
  const maxScore = keywords[0]?.score || 1;
  keywords.forEach((k) => {
    k.score = Math.round((k.score / maxScore) * 100);
  });
  
  return { keywords, totalWords };
}

// AI Question Generation
export async function generateQuestions(text: string, count: number = 5): Promise<QuestionResult> {
  const sentences = splitSentences(text);
  const wordFreq = getWordFrequency(text);
  
  // Find important sentences and convert to questions
  const scoredSentences = sentences
    .map((sentence) => ({
      sentence,
      score: scoreSentence(sentence, wordFreq),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count * 2);
  
  const questions: string[] = [];
  const questionTemplates = [
    { pattern: /^(.+)\s+(is|are|was|were)\s+(.+)$/i, template: 'What $2 $1?' },
    { pattern: /^(.+)\s+(has|have|had)\s+(.+)$/i, template: 'What does $1 have?' },
    { pattern: /^(.+)\s+(can|could|will|would)\s+(.+)$/i, template: 'What can $1 do?' },
  ];
  
  for (const { sentence } of scoredSentences) {
    if (questions.length >= count) break;
    
    // Try to convert sentence to question
    let converted = false;
    for (const { pattern, template } of questionTemplates) {
      const match = sentence.match(pattern);
      if (match) {
        const question = template.replace(/\$(\d)/g, (_, n) => match[parseInt(n)] || '');
        if (question.length > 10) {
          questions.push(question);
          converted = true;
          break;
        }
      }
    }
    
    // Fallback: create "What is X?" style questions
    if (!converted) {
      const words = sentence.split(' ').slice(0, 5).join(' ');
      if (words.length > 5) {
        questions.push(`What is the significance of "${words}..."?`);
      }
    }
  }
  
  // Add context-based questions
  const topKeywords = Array.from(wordFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  
  topKeywords.forEach(([word]) => {
    if (questions.length < count) {
      questions.push(`How does ${word} relate to the main topic?`);
    }
  });
  
  return { questions: questions.slice(0, count), count: questions.length };
}

// AI Bullet Point Generation
export async function generateBullets(text: string, count: number = 5): Promise<BulletResult> {
  const sentences = splitSentences(text);
  const wordFreq = getWordFrequency(text);
  
  // Score and select top sentences
  const bullets = sentences
    .map((sentence, index) => ({
      sentence,
      index,
      score: scoreSentence(sentence, wordFreq),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .sort((a, b) => a.index - b.index)
    .map(({ sentence }) => {
      // Clean and format as bullet point
      let bullet = sentence.trim();
      if (bullet.length > 100) {
        bullet = bullet.slice(0, 97) + '...';
      }
      return bullet;
    });
  
  return { bullets, count: bullets.length };
}

// Extract text from PDF using pdf.js
export async function extractTextFromPdf(file: File): Promise<string> {
  try {
    const pdfjsLib = await import('pdfjs-dist');
    
    // Set worker source - use CDN for reliability
    const pdfjsVersion = pdfjsLib.version;
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.mjs`;
    
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const text = content.items
        .map((item: unknown) => {
          const textItem = item as { str?: string };
          return textItem.str || '';
        })
        .join(' ');
      fullText += text + '\n\n';
    }
    
    return fullText.trim() || 'No text content found in PDF. The PDF might be scanned/image-based. Try the OCR tool instead.';
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error('Failed to extract text from PDF. The file may be corrupted or password-protected.');
  }
}
