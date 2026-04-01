"""
PDF Service - PDF manipulation operations
Provides compression, splitting, merging, and page extraction
"""

import os
import io
import zipfile
import tempfile
from typing import List, Dict, Optional, Tuple
from PyPDF2 import PdfReader, PdfWriter, PdfMerger
from PIL import Image

class PDFService:
    def __init__(self):
        self.temp_dir = tempfile.mkdtemp(prefix='docushrink_pdf_')
    
    # ==================== PDF COMPRESSION ====================
    
    def compress_pdf(self, pdf_bytes: bytes, quality: int = 50) -> Dict:
        """
        Compress a PDF file by optimizing images and removing redundant data
        
        Args:
            pdf_bytes: Input PDF as bytes
            quality: Compression quality (1-100, lower = smaller file)
        
        Returns:
            Dict with compressed PDF bytes and metadata
        """
        try:
            input_size = len(pdf_bytes)
            reader = PdfReader(io.BytesIO(pdf_bytes))
            writer = PdfWriter()
            
            # Copy pages with compression
            for page in reader.pages:
                writer.add_page(page)
            
            # Remove metadata to reduce size
            writer.add_metadata({})
            
            # Compress content streams
            for page in writer.pages:
                page.compress_content_streams()
            
            # Write to bytes
            output = io.BytesIO()
            writer.write(output)
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
                'page_count': len(reader.pages)
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    # ==================== PDF SPLITTING ====================
    
    def split_pdf(self, pdf_bytes: bytes, page_range: str) -> Dict:
        """
        Extract specific pages from a PDF
        
        Args:
            pdf_bytes: Input PDF as bytes
            page_range: Page range string (e.g., "1-3,5,7-9")
        
        Returns:
            Dict with extracted PDF bytes
        """
        try:
            reader = PdfReader(io.BytesIO(pdf_bytes))
            total_pages = len(reader.pages)
            
            # Parse page range
            pages = self._parse_page_range(page_range, total_pages)
            
            if not pages:
                return {
                    'success': False,
                    'error': 'No valid pages specified'
                }
            
            # Extract pages
            writer = PdfWriter()
            for page_num in pages:
                writer.add_page(reader.pages[page_num - 1])
            
            # Write to bytes
            output = io.BytesIO()
            writer.write(output)
            
            return {
                'success': True,
                'data': output.getvalue(),
                'pages_extracted': len(pages),
                'total_pages': total_pages,
                'selected_pages': pages
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    # ==================== SPLIT TO MANY PDFs ====================
    
    def split_to_many(self, pdf_bytes: bytes, pages_per_file: int = 1) -> Dict:
        """
        Split a PDF into multiple PDFs
        
        Args:
            pdf_bytes: Input PDF as bytes
            pages_per_file: Number of pages per output file
        
        Returns:
            Dict with ZIP file containing all PDFs
        """
        try:
            reader = PdfReader(io.BytesIO(pdf_bytes))
            total_pages = len(reader.pages)
            
            if pages_per_file < 1:
                pages_per_file = 1
            
            # Create ZIP file in memory
            zip_buffer = io.BytesIO()
            
            with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
                file_count = 0
                
                for start in range(0, total_pages, pages_per_file):
                    end = min(start + pages_per_file, total_pages)
                    writer = PdfWriter()
                    
                    for page_num in range(start, end):
                        writer.add_page(reader.pages[page_num])
                    
                    # Write PDF to memory
                    pdf_output = io.BytesIO()
                    writer.write(pdf_output)
                    
                    # Add to ZIP
                    file_count += 1
                    filename = f"document_pages_{start + 1}-{end}.pdf"
                    zip_file.writestr(filename, pdf_output.getvalue())
            
            return {
                'success': True,
                'data': zip_buffer.getvalue(),
                'file_count': file_count,
                'total_pages': total_pages,
                'pages_per_file': pages_per_file
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    # ==================== MERGE PDFs ====================
    
    def merge_pdfs(self, pdf_files: List[Tuple[str, bytes]]) -> Dict:
        """
        Merge multiple PDFs into one
        
        Args:
            pdf_files: List of tuples (filename, pdf_bytes)
        
        Returns:
            Dict with merged PDF bytes
        """
        try:
            if len(pdf_files) < 2:
                return {
                    'success': False,
                    'error': 'At least 2 PDFs required for merging'
                }
            
            merger = PdfMerger()
            total_pages = 0
            
            for filename, pdf_bytes in pdf_files:
                reader = PdfReader(io.BytesIO(pdf_bytes))
                merger.append(io.BytesIO(pdf_bytes))
                total_pages += len(reader.pages)
            
            # Write merged PDF
            output = io.BytesIO()
            merger.write(output)
            merger.close()
            
            return {
                'success': True,
                'data': output.getvalue(),
                'files_merged': len(pdf_files),
                'total_pages': total_pages
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    # ==================== EXTRACT TEXT ====================
    
    def extract_text(self, pdf_bytes: bytes) -> Dict:
        """
        Extract text content from PDF
        
        Args:
            pdf_bytes: Input PDF as bytes
        
        Returns:
            Dict with extracted text
        """
        try:
            reader = PdfReader(io.BytesIO(pdf_bytes))
            text_parts = []
            
            for i, page in enumerate(reader.pages):
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(f"--- Page {i + 1} ---\n{page_text}")
            
            full_text = '\n\n'.join(text_parts)
            
            return {
                'success': True,
                'text': full_text,
                'page_count': len(reader.pages),
                'char_count': len(full_text)
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    # ==================== UTILITY METHODS ====================
    
    def _parse_page_range(self, range_str: str, max_pages: int) -> List[int]:
        """
        Parse page range string into list of page numbers
        
        Examples:
            "1-3,5,7-9" -> [1, 2, 3, 5, 7, 8, 9]
            "1,3,5" -> [1, 3, 5]
            "1-5" -> [1, 2, 3, 4, 5]
        """
        pages = set()
        
        for part in range_str.split(','):
            part = part.strip()
            if not part:
                continue
            
            if '-' in part:
                try:
                    start, end = part.split('-', 1)
                    start = max(1, int(start.strip()))
                    end = min(max_pages, int(end.strip()))
                    pages.update(range(start, end + 1))
                except ValueError:
                    continue
            else:
                try:
                    page = int(part)
                    if 1 <= page <= max_pages:
                        pages.add(page)
                except ValueError:
                    continue
        
        return sorted(pages)
    
    def get_pdf_info(self, pdf_bytes: bytes) -> Dict:
        """Get PDF metadata and information"""
        try:
            reader = PdfReader(io.BytesIO(pdf_bytes))
            metadata = reader.metadata
            
            return {
                'success': True,
                'page_count': len(reader.pages),
                'title': metadata.get('/Title', '') if metadata else '',
                'author': metadata.get('/Author', '') if metadata else '',
                'creator': metadata.get('/Creator', '') if metadata else '',
                'file_size': len(pdf_bytes)
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }


# Singleton instance
pdf_service = PDFService()
