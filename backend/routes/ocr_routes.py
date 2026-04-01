"""
OCR Routes - API endpoints for OCR text extraction
"""

from flask import Blueprint, request, jsonify
from services.ocr_service import ocr_service

ocr_bp = Blueprint('ocr', __name__)


@ocr_bp.route('/ocr', methods=['POST'])
def extract_text():
    """
    Extract text from an image using OCR
    
    Request:
        - file: Image or PDF file (multipart/form-data)
        - language: string (optional) - Language code (default 'eng')
    
    Returns:
        - text: Extracted text
        - confidence: OCR confidence score
        - word_count: Number of words extracted
    """
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        language = request.form.get('language', 'eng')
        
        file_bytes = file.read()
        filename = file.filename.lower()
        
        # Determine if PDF or image
        if filename.endswith('.pdf'):
            result = ocr_service.extract_text_from_pdf(file_bytes, language)
        else:
            # Validate image type
            allowed_extensions = {'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'tif'}
            ext = filename.rsplit('.', 1)[-1] if '.' in filename else ''
            
            if ext not in allowed_extensions:
                return jsonify({'error': 'Unsupported file format'}), 400
            
            result = ocr_service.extract_text_from_image(file_bytes, language)
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@ocr_bp.route('/ocr/batch', methods=['POST'])
def batch_ocr():
    """
    Extract text from multiple images
    
    Request:
        - files: Multiple image files (multipart/form-data)
        - language: string (optional) - Language code (default 'eng')
    
    Returns:
        - results: Array of OCR results for each image
    """
    try:
        if 'files' not in request.files:
            return jsonify({'error': 'No files provided'}), 400
        
        files = request.files.getlist('files')
        language = request.form.get('language', 'eng')
        
        images = []
        for file in files:
            images.append((file.filename, file.read()))
        
        result = ocr_service.batch_ocr(images, language)
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@ocr_bp.route('/ocr/languages', methods=['GET'])
def get_languages():
    """
    Get list of supported OCR languages
    
    Returns:
        - languages: Dictionary of language codes and names
    """
    return jsonify(ocr_service.get_supported_languages())


@ocr_bp.route('/ocr/status', methods=['GET'])
def check_status():
    """
    Check OCR service availability
    
    Returns:
        - tesseract_available: boolean
        - tesseract_version: string or null
        - pdf2image_available: boolean
    """
    return jsonify(ocr_service.check_availability())
