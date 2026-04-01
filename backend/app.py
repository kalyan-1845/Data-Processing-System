"""
DocuShrink AI - Smart Document Processing System
Main Flask Application Entry Point
"""

from flask import Flask, jsonify
from flask_cors import CORS
import os
import tempfile
import atexit
import shutil

# Import routes
from routes.ai_routes import ai_bp
from routes.pdf_routes import pdf_bp
from routes.image_routes import image_bp
from routes.ocr_routes import ocr_bp

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://localhost:3000", "*"])

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB max file size
app.config['UPLOAD_FOLDER'] = tempfile.mkdtemp(prefix='docushrink_')
app.config['SECRET_KEY'] = os.urandom(24)

# Ensure upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Register blueprints
app.register_blueprint(ai_bp, url_prefix='/api/ai')
app.register_blueprint(pdf_bp, url_prefix='/api/pdf')
app.register_blueprint(image_bp, url_prefix='/api/image')
app.register_blueprint(ocr_bp, url_prefix='/api')

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'DocuShrink AI',
        'version': '1.0.0'
    })

# Root endpoint
@app.route('/', methods=['GET'])
def root():
    return jsonify({
        'message': 'Welcome to DocuShrink AI API',
        'endpoints': {
            'ai': {
                'summarize': 'POST /api/ai/summarize',
                'keywords': 'POST /api/ai/keywords',
                'questions': 'POST /api/ai/questions',
                'bullets': 'POST /api/ai/bullets'
            },
            'pdf': {
                'compress': 'POST /api/pdf/compress',
                'split': 'POST /api/pdf/split',
                'split-many': 'POST /api/pdf/split-many',
                'merge': 'POST /api/pdf/merge'
            },
            'image': {
                'compress': 'POST /api/image/compress'
            },
            'ocr': {
                'extract': 'POST /api/ocr'
            }
        }
    })

# Cleanup temp files on exit
def cleanup_temp_files():
    if os.path.exists(app.config['UPLOAD_FOLDER']):
        shutil.rmtree(app.config['UPLOAD_FOLDER'], ignore_errors=True)

atexit.register(cleanup_temp_files)

# Error handlers
@app.errorhandler(413)
def request_entity_too_large(error):
    return jsonify({'error': 'File too large. Maximum size is 100MB.'}), 413

@app.errorhandler(500)
def internal_server_error(error):
    return jsonify({'error': 'Internal server error'}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

if __name__ == '__main__':
    print("=" * 50)
    print("  DocuShrink AI - Document Processing System")
    print("=" * 50)
    print(f"  Upload folder: {app.config['UPLOAD_FOLDER']}")
    print("  Starting server on http://localhost:5000")
    print("=" * 50)
    app.run(host='0.0.0.0', port=5000, debug=True)
