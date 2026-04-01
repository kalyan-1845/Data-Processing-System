"""
AI Routes - API endpoints for AI-powered text processing
"""

from flask import Blueprint, request, jsonify
from services.ai_service import ai_service

ai_bp = Blueprint('ai', __name__)


@ai_bp.route('/summarize', methods=['POST'])
def summarize():
    """
    Summarize text content
    
    Request body:
        - text: string (required) - Text to summarize
        - ratio: float (optional) - Compression ratio (0.1-0.9, default 0.3)
        - max_length: int (optional) - Maximum summary length (default 500)
    
    Returns:
        - summary: string - Summarized text
        - method: string - 'ai_model' or 'extractive_fallback'
        - original_length: int
        - summary_length: int
    """
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({'error': 'Text is required'}), 400
        
        text = data['text']
        ratio = float(data.get('ratio', 0.3))
        max_length = int(data.get('max_length', 500))
        
        # Validate ratio
        ratio = max(0.1, min(0.9, ratio))
        
        result = ai_service.summarize(text, ratio, max_length)
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@ai_bp.route('/keywords', methods=['POST'])
def extract_keywords():
    """
    Extract keywords from text
    
    Request body:
        - text: string (required) - Text to analyze
        - num_keywords: int (optional) - Number of keywords (default 10)
    
    Returns:
        - keywords: array - List of keyword objects with word, score, count
        - total_words: int
        - unique_words: int
    """
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({'error': 'Text is required'}), 400
        
        text = data['text']
        num_keywords = int(data.get('num_keywords', 10))
        
        result = ai_service.extract_keywords(text, num_keywords)
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@ai_bp.route('/questions', methods=['POST'])
def generate_questions():
    """
    Generate questions from text
    
    Request body:
        - text: string (required) - Text to analyze
        - num_questions: int (optional) - Number of questions (default 5)
    
    Returns:
        - questions: array - List of generated questions
        - total_generated: int
    """
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({'error': 'Text is required'}), 400
        
        text = data['text']
        num_questions = int(data.get('num_questions', 5))
        
        result = ai_service.generate_questions(text, num_questions)
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@ai_bp.route('/bullets', methods=['POST'])
def generate_bullets():
    """
    Generate bullet points from text
    
    Request body:
        - text: string (required) - Text to analyze
        - num_bullets: int (optional) - Number of bullet points (default 5)
    
    Returns:
        - bullets: array - List of bullet point strings
        - total_sentences: int
    """
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({'error': 'Text is required'}), 400
        
        text = data['text']
        num_bullets = int(data.get('num_bullets', 5))
        
        result = ai_service.generate_bullets(text, num_bullets)
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@ai_bp.route('/analyze', methods=['POST'])
def full_analysis():
    """
    Perform full text analysis (summary + keywords + questions + bullets)
    
    Request body:
        - text: string (required) - Text to analyze
    
    Returns:
        - summary: object
        - keywords: object
        - questions: object
        - bullets: object
    """
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({'error': 'Text is required'}), 400
        
        text = data['text']
        
        return jsonify({
            'success': True,
            'summary': ai_service.summarize(text),
            'keywords': ai_service.extract_keywords(text),
            'questions': ai_service.generate_questions(text),
            'bullets': ai_service.generate_bullets(text)
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
