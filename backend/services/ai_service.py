"""
AI Service - Text Processing with HuggingFace Transformers
Provides summarization, keyword extraction, question generation, and bullet points
"""

import re
import math
from collections import Counter
from typing import List, Dict, Tuple, Optional

# Try to import transformers, fallback to rule-based if not available
try:
    from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False
    print("Warning: transformers not available, using rule-based fallback")

class AIService:
    def __init__(self):
        self.summarizer = None
        self.qa_model = None
        self._init_models()
    
    def _init_models(self):
        """Initialize HuggingFace models (lazy loading)"""
        if TRANSFORMERS_AVAILABLE:
            try:
                # Use smaller models for faster inference
                self.summarizer = pipeline(
                    "summarization",
                    model="sshleifer/distilbart-cnn-6-6",
                    device=-1  # CPU
                )
            except Exception as e:
                print(f"Could not load summarization model: {e}")
                self.summarizer = None
    
    # ==================== SUMMARIZATION ====================
    
    def summarize(self, text: str, ratio: float = 0.3, max_length: int = 500) -> Dict:
        """
        Summarize text using AI model with rule-based fallback
        
        Args:
            text: Input text to summarize
            ratio: Compression ratio (0.1 to 0.9)
            max_length: Maximum summary length
        
        Returns:
            Dict with summary and metadata
        """
        if not text or len(text.strip()) < 50:
            return {
                'success': False,
                'error': 'Text too short to summarize',
                'summary': ''
            }
        
        # Try AI model first
        if self.summarizer and TRANSFORMERS_AVAILABLE:
            try:
                input_length = len(text.split())
                target_length = max(30, int(input_length * ratio))
                
                result = self.summarizer(
                    text[:4096],  # Limit input for model
                    max_length=min(target_length, max_length),
                    min_length=max(10, target_length // 2),
                    do_sample=False
                )
                
                return {
                    'success': True,
                    'summary': result[0]['summary_text'],
                    'method': 'ai_model',
                    'original_length': len(text),
                    'summary_length': len(result[0]['summary_text'])
                }
            except Exception as e:
                print(f"AI summarization failed, using fallback: {e}")
        
        # Rule-based fallback: Extractive summarization
        summary = self._extractive_summarize(text, ratio)
        return {
            'success': True,
            'summary': summary,
            'method': 'extractive_fallback',
            'original_length': len(text),
            'summary_length': len(summary)
        }
    
    def _extractive_summarize(self, text: str, ratio: float) -> str:
        """Extract most important sentences based on word frequency"""
        sentences = self._split_sentences(text)
        if len(sentences) <= 2:
            return text
        
        # Calculate word frequencies
        words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
        word_freq = Counter(words)
        
        # Remove common stop words
        stop_words = {'the', 'and', 'is', 'in', 'to', 'of', 'a', 'that', 'it', 
                      'for', 'on', 'with', 'as', 'this', 'by', 'are', 'was', 'be'}
        for sw in stop_words:
            word_freq.pop(sw, None)
        
        # Score sentences
        scored_sentences = []
        for i, sentence in enumerate(sentences):
            words_in_sent = re.findall(r'\b[a-zA-Z]{3,}\b', sentence.lower())
            if not words_in_sent:
                continue
            score = sum(word_freq.get(w, 0) for w in words_in_sent) / len(words_in_sent)
            # Boost first sentences
            if i < 2:
                score *= 1.5
            scored_sentences.append((score, i, sentence))
        
        # Select top sentences
        num_sentences = max(1, int(len(sentences) * ratio))
        scored_sentences.sort(reverse=True)
        selected = sorted(scored_sentences[:num_sentences], key=lambda x: x[1])
        
        return ' '.join(s[2] for s in selected)
    
    # ==================== KEYWORD EXTRACTION ====================
    
    def extract_keywords(self, text: str, num_keywords: int = 10) -> Dict:
        """
        Extract keywords using TF-IDF algorithm
        
        Args:
            text: Input text
            num_keywords: Number of keywords to extract
        
        Returns:
            Dict with keywords and scores
        """
        if not text or len(text.strip()) < 20:
            return {
                'success': False,
                'error': 'Text too short for keyword extraction',
                'keywords': []
            }
        
        # Tokenize and clean
        words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
        
        # Extended stop words
        stop_words = {
            'the', 'and', 'is', 'in', 'to', 'of', 'a', 'that', 'it', 'for',
            'on', 'with', 'as', 'this', 'by', 'are', 'was', 'be', 'have',
            'has', 'had', 'been', 'will', 'would', 'could', 'should', 'may',
            'might', 'can', 'do', 'does', 'did', 'but', 'or', 'an', 'from',
            'they', 'we', 'you', 'your', 'their', 'its', 'his', 'her', 'our',
            'which', 'who', 'what', 'when', 'where', 'how', 'why', 'all',
            'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some',
            'such', 'than', 'too', 'very', 'just', 'also', 'now', 'only'
        }
        
        filtered_words = [w for w in words if w not in stop_words]
        
        if not filtered_words:
            return {
                'success': False,
                'error': 'No meaningful keywords found',
                'keywords': []
            }
        
        # Calculate TF (Term Frequency)
        word_count = Counter(filtered_words)
        total_words = len(filtered_words)
        
        # Calculate scores with position boost
        word_positions = {}
        for i, word in enumerate(filtered_words):
            if word not in word_positions:
                word_positions[word] = i
        
        keywords = []
        for word, count in word_count.most_common(num_keywords * 2):
            tf = count / total_words
            # Boost words appearing early
            position_boost = 1 + (1 - word_positions[word] / len(filtered_words)) * 0.5
            # Boost longer words
            length_boost = 1 + min(len(word) - 3, 5) * 0.1
            score = tf * position_boost * length_boost
            keywords.append({
                'word': word,
                'score': round(score * 100, 2),
                'count': count
            })
        
        # Sort by score and take top N
        keywords.sort(key=lambda x: x['score'], reverse=True)
        keywords = keywords[:num_keywords]
        
        return {
            'success': True,
            'keywords': keywords,
            'total_words': total_words,
            'unique_words': len(word_count)
        }
    
    # ==================== QUESTION GENERATION ====================
    
    def generate_questions(self, text: str, num_questions: int = 5) -> Dict:
        """
        Generate questions from text using pattern matching
        
        Args:
            text: Input text
            num_questions: Number of questions to generate
        
        Returns:
            Dict with generated questions
        """
        if not text or len(text.strip()) < 50:
            return {
                'success': False,
                'error': 'Text too short to generate questions',
                'questions': []
            }
        
        sentences = self._split_sentences(text)
        questions = []
        
        # Pattern-based question generation
        patterns = [
            # Definition patterns
            (r'(\w+(?:\s+\w+)?)\s+(?:is|are|was|were)\s+(?:a|an|the)?\s*(.+?)(?:\.|$)', 
             lambda m: f"What is {m.group(1)}?"),
            
            # Process patterns
            (r'(\w+(?:\s+\w+)?)\s+(?:can|could|may|might)\s+(.+?)(?:\.|$)',
             lambda m: f"What can {m.group(1)} do?"),
            
            # Cause-effect patterns
            (r'(?:because|since|due to)\s+(.+?),?\s*(.+?)(?:\.|$)',
             lambda m: f"Why does {m.group(2).strip()}?"),
            
            # Comparison patterns
            (r'(\w+)\s+(?:is|are)\s+(?:more|less|better|worse)\s+(?:than)\s+(\w+)',
             lambda m: f"How does {m.group(1)} compare to {m.group(2)}?"),
            
            # Purpose patterns
            (r'(?:in order to|to)\s+(\w+(?:\s+\w+)*)',
             lambda m: f"What is the purpose of {m.group(1)}?"),
        ]
        
        for sentence in sentences:
            if len(questions) >= num_questions:
                break
            
            for pattern, generator in patterns:
                match = re.search(pattern, sentence, re.IGNORECASE)
                if match:
                    try:
                        question = generator(match)
                        if question and len(question) > 10 and question not in questions:
                            questions.append(question)
                            break
                    except:
                        continue
        
        # Fallback: Generate basic questions from key sentences
        if len(questions) < num_questions:
            keywords_result = self.extract_keywords(text, 5)
            if keywords_result['success']:
                for kw in keywords_result['keywords']:
                    if len(questions) >= num_questions:
                        break
                    q = f"What is the significance of {kw['word']} in this context?"
                    if q not in questions:
                        questions.append(q)
        
        return {
            'success': True,
            'questions': questions[:num_questions],
            'total_generated': len(questions)
        }
    
    # ==================== BULLET POINT GENERATION ====================
    
    def generate_bullets(self, text: str, num_bullets: int = 5) -> Dict:
        """
        Extract key points as bullet points
        
        Args:
            text: Input text
            num_bullets: Number of bullet points to generate
        
        Returns:
            Dict with bullet points
        """
        if not text or len(text.strip()) < 50:
            return {
                'success': False,
                'error': 'Text too short to generate bullet points',
                'bullets': []
            }
        
        sentences = self._split_sentences(text)
        
        # Score sentences for importance
        keywords_result = self.extract_keywords(text, 20)
        keyword_set = set()
        if keywords_result['success']:
            keyword_set = {kw['word'] for kw in keywords_result['keywords']}
        
        scored_sentences = []
        for i, sentence in enumerate(sentences):
            if len(sentence) < 20 or len(sentence) > 200:
                continue
            
            # Score based on keyword presence
            words = set(re.findall(r'\b[a-zA-Z]{3,}\b', sentence.lower()))
            keyword_overlap = len(words & keyword_set)
            
            # Boost sentences with action verbs
            action_verbs = {'create', 'develop', 'implement', 'provide', 'enable',
                           'support', 'improve', 'reduce', 'increase', 'help'}
            has_action = any(v in sentence.lower() for v in action_verbs)
            
            # Boost sentences with key phrases
            key_phrases = ['important', 'key', 'main', 'primary', 'essential',
                          'significant', 'critical', 'major', 'fundamental']
            has_key_phrase = any(p in sentence.lower() for p in key_phrases)
            
            score = keyword_overlap
            if has_action:
                score += 2
            if has_key_phrase:
                score += 3
            if i < 3:  # Boost early sentences
                score += 1
            
            scored_sentences.append((score, sentence))
        
        # Select top sentences
        scored_sentences.sort(reverse=True)
        bullets = []
        
        for score, sentence in scored_sentences[:num_bullets]:
            # Clean and format as bullet point
            bullet = sentence.strip()
            # Remove leading conjunctions
            bullet = re.sub(r'^(?:and|but|or|so|yet|however|therefore)\s+', '', bullet, flags=re.IGNORECASE)
            # Ensure it ends with proper punctuation
            if not bullet.endswith(('.', '!', '?')):
                bullet += '.'
            bullets.append(bullet)
        
        return {
            'success': True,
            'bullets': bullets,
            'total_sentences': len(sentences)
        }
    
    # ==================== UTILITY METHODS ====================
    
    def _split_sentences(self, text: str) -> List[str]:
        """Split text into sentences"""
        # Handle common abbreviations
        text = re.sub(r'(Mr|Mrs|Ms|Dr|Prof|Sr|Jr|vs|etc|e\.g|i\.e)\.', r'\1<DOT>', text)
        sentences = re.split(r'(?<=[.!?])\s+', text)
        return [s.replace('<DOT>', '.').strip() for s in sentences if s.strip()]


# Singleton instance
ai_service = AIService()
