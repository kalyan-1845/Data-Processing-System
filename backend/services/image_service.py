"""
Image Service - Image compression and manipulation
Provides quality-based compression, resizing, and format conversion
"""

import io
from typing import Dict, Optional, Tuple
from PIL import Image

class ImageService:
    SUPPORTED_FORMATS = {'JPEG', 'PNG', 'WEBP', 'GIF'}
    FORMAT_EXTENSIONS = {
        'JPEG': 'jpg',
        'PNG': 'png',
        'WEBP': 'webp',
        'GIF': 'gif'
    }
    
    def __init__(self):
        pass
    
    # ==================== IMAGE COMPRESSION ====================
    
    def compress_image(
        self,
        image_bytes: bytes,
        quality: int = 80,
        max_width: Optional[int] = None,
        max_height: Optional[int] = None,
        output_format: Optional[str] = None
    ) -> Dict:
        """
        Compress an image with quality, size, and format options
        
        Args:
            image_bytes: Input image as bytes
            quality: JPEG/WebP quality (1-100)
            max_width: Maximum width (preserves aspect ratio)
            max_height: Maximum height (preserves aspect ratio)
            output_format: Output format (JPEG, PNG, WEBP)
        
        Returns:
            Dict with compressed image bytes and metadata
        """
        try:
            input_size = len(image_bytes)
            
            # Open image
            image = Image.open(io.BytesIO(image_bytes))
            original_format = image.format or 'JPEG'
            original_size = image.size
            
            # Convert RGBA to RGB for JPEG
            if image.mode == 'RGBA' and (output_format == 'JPEG' or 
                (output_format is None and original_format == 'JPEG')):
                background = Image.new('RGB', image.size, (255, 255, 255))
                background.paste(image, mask=image.split()[3])
                image = background
            elif image.mode not in ('RGB', 'L'):
                image = image.convert('RGB')
            
            # Resize if needed
            if max_width or max_height:
                image = self._resize_image(image, max_width, max_height)
            
            # Determine output format
            out_format = output_format or original_format
            if out_format not in self.SUPPORTED_FORMATS:
                out_format = 'JPEG'
            
            # Compress
            output = io.BytesIO()
            save_kwargs = self._get_save_kwargs(out_format, quality)
            image.save(output, format=out_format, **save_kwargs)
            output_bytes = output.getvalue()
            output_size = len(output_bytes)
            
            # Calculate compression ratio
            ratio = (1 - output_size / input_size) * 100 if input_size > 0 else 0
            
            return {
                'success': True,
                'data': output_bytes,
                'original_size': input_size,
                'compressed_size': output_size,
                'compression_ratio': round(ratio, 2),
                'original_dimensions': original_size,
                'new_dimensions': image.size,
                'format': out_format,
                'extension': self.FORMAT_EXTENSIONS.get(out_format, 'jpg')
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    # ==================== BATCH COMPRESSION ====================
    
    def compress_batch(
        self,
        images: list,
        quality: int = 80,
        max_width: Optional[int] = None,
        max_height: Optional[int] = None,
        output_format: Optional[str] = None
    ) -> Dict:
        """
        Compress multiple images
        
        Args:
            images: List of tuples (filename, image_bytes)
            quality: JPEG/WebP quality (1-100)
            max_width: Maximum width
            max_height: Maximum height
            output_format: Output format
        
        Returns:
            Dict with compressed images and statistics
        """
        results = []
        total_original = 0
        total_compressed = 0
        
        for filename, image_bytes in images:
            result = self.compress_image(
                image_bytes,
                quality,
                max_width,
                max_height,
                output_format
            )
            
            if result['success']:
                total_original += result['original_size']
                total_compressed += result['compressed_size']
                results.append({
                    'filename': filename,
                    'success': True,
                    'data': result['data'],
                    'original_size': result['original_size'],
                    'compressed_size': result['compressed_size']
                })
            else:
                results.append({
                    'filename': filename,
                    'success': False,
                    'error': result['error']
                })
        
        overall_ratio = (1 - total_compressed / total_original) * 100 if total_original > 0 else 0
        
        return {
            'success': True,
            'results': results,
            'total_original': total_original,
            'total_compressed': total_compressed,
            'overall_ratio': round(overall_ratio, 2),
            'processed_count': len([r for r in results if r['success']])
        }
    
    # ==================== IMAGE INFO ====================
    
    def get_image_info(self, image_bytes: bytes) -> Dict:
        """Get image metadata and information"""
        try:
            image = Image.open(io.BytesIO(image_bytes))
            
            return {
                'success': True,
                'format': image.format,
                'mode': image.mode,
                'width': image.size[0],
                'height': image.size[1],
                'file_size': len(image_bytes),
                'has_alpha': image.mode in ('RGBA', 'LA', 'PA')
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    # ==================== FORMAT CONVERSION ====================
    
    def convert_format(
        self,
        image_bytes: bytes,
        output_format: str,
        quality: int = 90
    ) -> Dict:
        """
        Convert image to different format
        
        Args:
            image_bytes: Input image as bytes
            output_format: Target format (JPEG, PNG, WEBP)
            quality: Quality for lossy formats
        
        Returns:
            Dict with converted image
        """
        if output_format.upper() not in self.SUPPORTED_FORMATS:
            return {
                'success': False,
                'error': f'Unsupported format: {output_format}'
            }
        
        return self.compress_image(
            image_bytes,
            quality=quality,
            output_format=output_format.upper()
        )
    
    # ==================== UTILITY METHODS ====================
    
    def _resize_image(
        self,
        image: Image.Image,
        max_width: Optional[int],
        max_height: Optional[int]
    ) -> Image.Image:
        """Resize image while preserving aspect ratio"""
        original_width, original_height = image.size
        
        if max_width is None:
            max_width = original_width
        if max_height is None:
            max_height = original_height
        
        # Calculate scaling factor
        width_ratio = max_width / original_width
        height_ratio = max_height / original_height
        ratio = min(width_ratio, height_ratio)
        
        # Only resize if image is larger
        if ratio < 1:
            new_width = int(original_width * ratio)
            new_height = int(original_height * ratio)
            return image.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        return image
    
    def _get_save_kwargs(self, format: str, quality: int) -> dict:
        """Get format-specific save options"""
        kwargs = {}
        
        if format == 'JPEG':
            kwargs['quality'] = quality
            kwargs['optimize'] = True
            kwargs['progressive'] = True
        elif format == 'PNG':
            kwargs['optimize'] = True
            # For PNG, lower quality means more compression
            compress_level = min(9, max(0, (100 - quality) // 10))
            kwargs['compress_level'] = compress_level
        elif format == 'WEBP':
            kwargs['quality'] = quality
            kwargs['method'] = 4  # Compression effort (0-6)
        elif format == 'GIF':
            kwargs['optimize'] = True
        
        return kwargs


# Singleton instance
image_service = ImageService()
