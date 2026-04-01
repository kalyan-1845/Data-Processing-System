"""
PDF Routes - API endpoints for PDF processing
"""

import io
from flask import Blueprint, request, jsonify, send_file
from services.pdf_service import pdf_service

pdf_bp = Blueprint('pdf', __name__)


@pdf_bp.route('/compress', methods=['POST'])
def compress_pdf():
    """
    Compress a PDF file
    
    Request:
        - file: PDF file (multipart/form-data)
        - quality: int (optional) - Compression quality 1-100 (default 50)
    
    Returns:
        - Compressed PDF file
    """
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if not file.filename.lower().endswith('.pdf'):
            return jsonify({'error': 'File must be a PDF'}), 400
        
        quality = int(request.form.get('quality', 50))
        pdf_bytes = file.read()
        
        result = pdf_service.compress_pdf(pdf_bytes, quality)
        
        if result['success']:
            return send_file(
                io.BytesIO(result['data']),
                mimetype='application/pdf',
                as_attachment=True,
                download_name=f"compressed_{file.filename}"
            )
        else:
            return jsonify(result), 400
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@pdf_bp.route('/split', methods=['POST'])
def split_pdf():
    """
    Extract specific pages from a PDF
    
    Request:
        - file: PDF file (multipart/form-data)
        - pages: string - Page range (e.g., "1-3,5,7-9")
    
    Returns:
        - PDF file with extracted pages
    """
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if not file.filename.lower().endswith('.pdf'):
            return jsonify({'error': 'File must be a PDF'}), 400
        
        page_range = request.form.get('pages', '1')
        pdf_bytes = file.read()
        
        result = pdf_service.split_pdf(pdf_bytes, page_range)
        
        if result['success']:
            return send_file(
                io.BytesIO(result['data']),
                mimetype='application/pdf',
                as_attachment=True,
                download_name=f"extracted_{file.filename}"
            )
        else:
            return jsonify(result), 400
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@pdf_bp.route('/split-many', methods=['POST'])
def split_to_many():
    """
    Split a PDF into multiple PDFs
    
    Request:
        - file: PDF file (multipart/form-data)
        - pages_per_file: int (optional) - Pages per output file (default 1)
    
    Returns:
        - ZIP file containing all PDFs
    """
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if not file.filename.lower().endswith('.pdf'):
            return jsonify({'error': 'File must be a PDF'}), 400
        
        pages_per_file = int(request.form.get('pages_per_file', 1))
        pdf_bytes = file.read()
        
        result = pdf_service.split_to_many(pdf_bytes, pages_per_file)
        
        if result['success']:
            base_name = file.filename.rsplit('.', 1)[0]
            return send_file(
                io.BytesIO(result['data']),
                mimetype='application/zip',
                as_attachment=True,
                download_name=f"{base_name}_split.zip"
            )
        else:
            return jsonify(result), 400
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@pdf_bp.route('/merge', methods=['POST'])
def merge_pdfs():
    """
    Merge multiple PDFs into one
    
    Request:
        - files: Multiple PDF files (multipart/form-data)
    
    Returns:
        - Merged PDF file
    """
    try:
        if 'files' not in request.files:
            return jsonify({'error': 'No files provided'}), 400
        
        files = request.files.getlist('files')
        
        if len(files) < 2:
            return jsonify({'error': 'At least 2 PDFs required for merging'}), 400
        
        pdf_files = []
        for file in files:
            if not file.filename.lower().endswith('.pdf'):
                return jsonify({'error': f'{file.filename} is not a PDF'}), 400
            pdf_files.append((file.filename, file.read()))
        
        result = pdf_service.merge_pdfs(pdf_files)
        
        if result['success']:
            return send_file(
                io.BytesIO(result['data']),
                mimetype='application/pdf',
                as_attachment=True,
                download_name='merged_document.pdf'
            )
        else:
            return jsonify(result), 400
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@pdf_bp.route('/extract-text', methods=['POST'])
def extract_text():
    """
    Extract text content from a PDF
    
    Request:
        - file: PDF file (multipart/form-data)
    
    Returns:
        - text: Extracted text content
        - page_count: Number of pages
    """
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if not file.filename.lower().endswith('.pdf'):
            return jsonify({'error': 'File must be a PDF'}), 400
        
        pdf_bytes = file.read()
        result = pdf_service.extract_text(pdf_bytes)
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@pdf_bp.route('/info', methods=['POST'])
def get_pdf_info():
    """
    Get PDF metadata and information
    
    Request:
        - file: PDF file (multipart/form-data)
    
    Returns:
        - page_count: Number of pages
        - title: Document title
        - author: Document author
        - file_size: File size in bytes
    """
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if not file.filename.lower().endswith('.pdf'):
            return jsonify({'error': 'File must be a PDF'}), 400
        
        pdf_bytes = file.read()
        result = pdf_service.get_pdf_info(pdf_bytes)
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
