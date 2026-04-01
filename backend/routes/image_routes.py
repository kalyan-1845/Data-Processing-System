"""
Image Routes - API endpoints for image processing
"""

import io
from flask import Blueprint, request, jsonify, send_file
from services.image_service import image_service

image_bp = Blueprint('image', __name__)


@image_bp.route('/compress', methods=['POST'])
def compress_image():
    """
    Compress an image file
    
    Request:
        - file: Image file (multipart/form-data)
        - quality: int (optional) - Compression quality 1-100 (default 80)
        - max_width: int (optional) - Maximum width in pixels
        - max_height: int (optional) - Maximum height in pixels
        - format: string (optional) - Output format (JPEG, PNG, WEBP)
    
    Returns:
        - Compressed image file
    """
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        # Validate image type
        allowed_extensions = {'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'}
        ext = file.filename.rsplit('.', 1)[-1].lower()
        if ext not in allowed_extensions:
            return jsonify({'error': 'Unsupported image format'}), 400
        
        # Get parameters
        quality = int(request.form.get('quality', 80))
        max_width = request.form.get('max_width')
        max_height = request.form.get('max_height')
        output_format = request.form.get('format')
        
        max_width = int(max_width) if max_width else None
        max_height = int(max_height) if max_height else None
        
        image_bytes = file.read()
        
        result = image_service.compress_image(
            image_bytes,
            quality=quality,
            max_width=max_width,
            max_height=max_height,
            output_format=output_format
        )
        
        if result['success']:
            mimetype = {
                'JPEG': 'image/jpeg',
                'PNG': 'image/png',
                'WEBP': 'image/webp',
                'GIF': 'image/gif'
            }.get(result['format'], 'image/jpeg')
            
            base_name = file.filename.rsplit('.', 1)[0]
            new_ext = result['extension']
            
            return send_file(
                io.BytesIO(result['data']),
                mimetype=mimetype,
                as_attachment=True,
                download_name=f"{base_name}_compressed.{new_ext}"
            )
        else:
            return jsonify(result), 400
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@image_bp.route('/compress-batch', methods=['POST'])
def compress_batch():
    """
    Compress multiple images
    
    Request:
        - files: Multiple image files (multipart/form-data)
        - quality: int (optional) - Compression quality 1-100 (default 80)
        - max_width: int (optional) - Maximum width in pixels
        - max_height: int (optional) - Maximum height in pixels
        - format: string (optional) - Output format (JPEG, PNG, WEBP)
    
    Returns:
        - ZIP file containing compressed images
    """
    import zipfile
    
    try:
        if 'files' not in request.files:
            return jsonify({'error': 'No files provided'}), 400
        
        files = request.files.getlist('files')
        
        if not files:
            return jsonify({'error': 'No files provided'}), 400
        
        # Get parameters
        quality = int(request.form.get('quality', 80))
        max_width = request.form.get('max_width')
        max_height = request.form.get('max_height')
        output_format = request.form.get('format')
        
        max_width = int(max_width) if max_width else None
        max_height = int(max_height) if max_height else None
        
        # Process images
        images = []
        for file in files:
            images.append((file.filename, file.read()))
        
        result = image_service.compress_batch(
            images,
            quality=quality,
            max_width=max_width,
            max_height=max_height,
            output_format=output_format
        )
        
        # Create ZIP file
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            for item in result['results']:
                if item['success']:
                    base_name = item['filename'].rsplit('.', 1)[0]
                    zip_file.writestr(
                        f"{base_name}_compressed.jpg",
                        item['data']
                    )
        
        return send_file(
            io.BytesIO(zip_buffer.getvalue()),
            mimetype='application/zip',
            as_attachment=True,
            download_name='compressed_images.zip'
        )
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@image_bp.route('/info', methods=['POST'])
def get_image_info():
    """
    Get image metadata and information
    
    Request:
        - file: Image file (multipart/form-data)
    
    Returns:
        - format: Image format
        - width: Width in pixels
        - height: Height in pixels
        - file_size: File size in bytes
        - mode: Color mode
    """
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        image_bytes = file.read()
        
        result = image_service.get_image_info(image_bytes)
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@image_bp.route('/convert', methods=['POST'])
def convert_format():
    """
    Convert image to different format
    
    Request:
        - file: Image file (multipart/form-data)
        - format: string - Target format (JPEG, PNG, WEBP)
        - quality: int (optional) - Quality for lossy formats (default 90)
    
    Returns:
        - Converted image file
    """
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        output_format = request.form.get('format', 'JPEG').upper()
        quality = int(request.form.get('quality', 90))
        
        image_bytes = file.read()
        
        result = image_service.convert_format(
            image_bytes,
            output_format=output_format,
            quality=quality
        )
        
        if result['success']:
            mimetype = {
                'JPEG': 'image/jpeg',
                'PNG': 'image/png',
                'WEBP': 'image/webp',
                'GIF': 'image/gif'
            }.get(result['format'], 'image/jpeg')
            
            base_name = file.filename.rsplit('.', 1)[0]
            new_ext = result['extension']
            
            return send_file(
                io.BytesIO(result['data']),
                mimetype=mimetype,
                as_attachment=True,
                download_name=f"{base_name}.{new_ext}"
            )
        else:
            return jsonify(result), 400
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
