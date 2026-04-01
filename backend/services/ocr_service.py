"""
OCR Service - Optical Character Recognition
Uses Tesseract for text extraction from images
"""

import io
from typing import Dict, Optional, List
from PIL import Image

# Try to import pytesseract
try:
    import pytesseract
    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False
    print("Warning: pytesseract not available")

# Try to import pdf2image for PDF OCR
try:
    from pdf2image import convert_from_bytes
    PDF2IMAGE_AVAILABLE = True
except ImportError:
    PDF2IMAGE_AVAILABLE = False
    print("Warning: pdf2image not available")


class OCRService:
    # Supported languages (Tesseract language codes)
    SUPPORTED_LANGUAGES = {
        'eng': 'English',
        'spa': 'Spanish',
        'fra': 'French',
        'deu': 'German',
        'ita': 'Italian',
        'por': 'Portuguese',
        'rus': 'Russian',
        'jpn': 'Japanese',
        'kor': 'Korean',
        'chi_sim': 'Chinese (Simplified)',
        'chi_tra': 'Chinese (Traditional)',
        'ara': 'Arabic',
        'hin': 'Hindi'
    }
    
    def __init__(self):
        self.is_available = TESSERACT_AVAILABLE
    
    # ==================== IMAGE OCR ====================
    
    def extract_text_from_image(
        self,
        image_bytes: bytes,
        language: str = 'eng',
        preprocess: bool = True
    ) -> Dict:
        """
        Extract text from an image using OCR
        
        Args:
            image_bytes: Input image as bytes
            language: Tesseract language code
            preprocess: Whether to preprocess image for better OCR
        
        Returns:
            Dict with extracted text and metadata
        """
        if not self.is_available:
            return self._fallback_response("Tesseract OCR is not installed")
        
        try:
            # Open image
            image = Image.open(io.BytesIO(image_bytes))
            
            # Preprocess for better OCR results
            if preprocess:
                image = self._preprocess_image(image)
            
            # Perform OCR
            text = pytesseract.image_to_string(
                image,
                lang=language,
                config='--psm 3'  # Automatic page segmentation
            )
            
            # Get detailed data
            data = pytesseract.image_to_data(
                image,
                lang=language,
                output_type=pytesseract.Output.DICT
            )
            
            # Calculate confidence
            confidences = [int(c) for c in data['conf'] if int(c) > 0]
            avg_confidence = sum(confidences) / len(confidences) if confidences else 0
            
            # Count words
            words = [w for w in data['text'] if w.strip()]
            
            return {
                'success': True,
                'text': text.strip(),
                'word_count': len(words),
                'char_count': len(text.strip()),
                'confidence': round(avg_confidence, 2),
                'language': language,
                'image_size': image.size
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    # ==================== PDF OCR ====================
    
    def extract_text_from_pdf(
        self,
        pdf_bytes: bytes,
        language: str = 'eng',
        pages: Optional[List[int]] = None
    ) -> Dict:
        """
        Extract text from a scanned PDF using OCR
        
        Args:
            pdf_bytes: Input PDF as bytes
            language: Tesseract language code
            pages: Specific pages to process (1-indexed), None for all
        
        Returns:
            Dict with extracted text from all pages
        """
        if not self.is_available:
            return self._fallback_response("Tesseract OCR is not installed")
        
        if not PDF2IMAGE_AVAILABLE:
            return self._fallback_response("pdf2image is not installed")
        
        try:
            # Convert PDF pages to images
            images = convert_from_bytes(
                pdf_bytes,
                dpi=300,
                fmt='png'
            )
            
            results = []
            total_confidence = 0
            total_words = 0
            
            for i, image in enumerate(images):
                page_num = i + 1
                
                # Skip if not in specified pages
                if pages and page_num not in pages:
                    continue
                
                # Preprocess
                image = self._preprocess_image(image)
                
                # OCR
                text = pytesseract.image_to_string(
                    image,
                    lang=language,
                    config='--psm 3'
                )
                
                # Get confidence
                data = pytesseract.image_to_data(
                    image,
                    lang=language,
                    output_type=pytesseract.Output.DICT
                )
                confidences = [int(c) for c in data['conf'] if int(c) > 0]
                page_confidence = sum(confidences) / len(confidences) if confidences else 0
                
                words = [w for w in data['text'] if w.strip()]
                
                results.append({
                    'page': page_num,
                    'text': text.strip(),
                    'word_count': len(words),
                    'confidence': round(page_confidence, 2)
                })
                
                total_confidence += page_confidence
                total_words += len(words)
            
            # Combine all text
            full_text = '\n\n'.join([
                f"--- Page {r['page']} ---\n{r['text']}"
                for r in results
            ])
            
            avg_confidence = total_confidence / len(results) if results else 0
            
            return {
                'success': True,
                'text': full_text,
                'pages': results,
                'total_pages': len(images),
                'processed_pages': len(results),
                'total_words': total_words,
                'average_confidence': round(avg_confidence, 2),
                'language': language
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    # ==================== BATCH OCR ====================
    
    def batch_ocr(
        self,
        images: List[tuple],
        language: str = 'eng'
    ) -> Dict:
        """
        Process multiple images with OCR
        
        Args:
            images: List of tuples (filename, image_bytes)
            language: Tesseract language code
        
        Returns:
            Dict with results for all images
        """
        results = []
        
        for filename, image_bytes in images:
            result = self.extract_text_from_image(image_bytes, language)
            results.append({
                'filename': filename,
                **result
            })
        
        successful = [r for r in results if r.get('success')]
        
        return {
            'success': True,
            'results': results,
            'total_processed': len(results),
            'successful': len(successful),
            'failed': len(results) - len(successful)
        }
    
    # ==================== UTILITY METHODS ====================
    
    def _preprocess_image(self, image: Image.Image) -> Image.Image:
        """Preprocess image for better OCR results"""
        # Convert to grayscale
        if image.mode != 'L':
            image = image.convert('L')
        
        # Resize if too small
        width, height = image.size
        if width < 300 or height < 300:
            scale = max(300 / width, 300 / height)
            new_size = (int(width * scale), int(height * scale))
            image = image.resize(new_size, Image.Resampling.LANCZOS)
        
        return image
    
    def _fallback_response(self, message: str) -> Dict:
        """Generate fallback response when OCR is not available"""
        return {
            'success': False,
            'error': message,
            'fallback': True,
            'instructions': [
                'Install Tesseract OCR: https://github.com/tesseract-ocr/tesseract',
                'Install pytesseract: pip install pytesseract',
                'For PDF OCR, also install: pip install pdf2image',
                'On Ubuntu: sudo apt-get install tesseract-ocr',
                'On macOS: brew install tesseract',
                'On Windows: Download installer from GitHub'
            ]
        }
    
    def get_supported_languages(self) -> Dict:
        """Get list of supported OCR languages"""
        return {
            'success': True,
            'languages': self.SUPPORTED_LANGUAGES,
            'default': 'eng'
        }
    
    def check_availability(self) -> Dict:
        """Check if OCR services are available"""
        tesseract_version = None
        if self.is_available:
            try:
                tesseract_version = pytesseract.get_tesseract_version()
            except:
                pass
        
        return {
            'tesseract_available': self.is_available,
            'tesseract_version': str(tesseract_version) if tesseract_version else None,
            'pdf2image_available': PDF2IMAGE_AVAILABLE
        }


# Singleton instance
ocr_service = OCRService()
