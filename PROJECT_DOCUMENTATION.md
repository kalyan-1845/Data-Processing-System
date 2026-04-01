# DocuShrink AI - Complete Project Documentation
## Smart Document Processing System

---

# TABLE OF CONTENTS

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Complete Folder Structure](#3-complete-folder-structure)
4. [File-by-File Explanation](#4-file-by-file-explanation)
5. [All Functions Explained](#5-all-functions-explained)
6. [Data Flow Diagrams](#6-data-flow-diagrams)
7. [Why Each File is Required](#7-why-each-file-is-required)
8. [API Endpoints](#8-api-endpoints)
9. [How to Run](#9-how-to-run)
10. [Interview Questions & Answers](#10-interview-questions--answers)

---

# 1. PROJECT OVERVIEW

## What is DocuShrink AI?

DocuShrink AI is a **web-based document processing application** that provides 10 AI-powered tools for processing documents, images, and text. It runs entirely in the browser (client-side) with an optional Python backend for enhanced AI capabilities.

## Key Features

| Feature # | Feature Name | What it Does |
|-----------|-------------|--------------|
| 1 | AI Text Summarizer | Reduces long text to key sentences |
| 2 | AI Keyword Extractor | Finds important words using TF-IDF algorithm |
| 3 | AI Question Generator | Creates questions from text content |
| 4 | AI Bullet Generator | Converts paragraphs to bullet points |
| 5 | OCR Text Extractor | Extracts text from images (13 languages) |
| 6 | PDF Compressor | Reduces PDF file size to target KB/MB |
| 7 | Image Compressor | Reduces image size to target KB/MB |
| 8 | PDF Split & Extract | Extracts specific pages from PDF |
| 9 | One PDF → Many PDFs | Splits one PDF into multiple files |
| 10 | Merge PDFs | Combines multiple PDFs into one |

## Why This Project?

1. **Privacy**: All processing happens locally - files never leave user's computer
2. **Cost-Free**: No API keys, no subscriptions, no hidden costs
3. **Offline Capable**: Works without internet after initial load
4. **Cross-Platform**: Works on any device with a modern browser

---

# 2. TECHNOLOGY STACK

## Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.x | JavaScript library for building user interfaces |
| **TypeScript** | 5.x | Adds type safety to JavaScript |
| **Vite** | 5.x | Fast build tool and development server |
| **Tailwind CSS** | 4.x | Utility-first CSS framework for styling |
| **Lucide React** | Latest | Icon library (SVG icons) |

## Core Processing Libraries

| Library | Purpose | Used In |
|---------|---------|---------|
| **pdf-lib** | Create, modify, merge, split PDFs | PDF operations |
| **pdfjs-dist** | Extract text from PDFs | AI text processing |
| **tesseract.js** | Optical Character Recognition (OCR) | Image to text |
| **jszip** | Create ZIP archives | Multi-file downloads |
| **file-saver** | Trigger file downloads | All download features |

## Backend Technologies (Optional)

| Technology | Purpose |
|------------|---------|
| **Python 3.8+** | Programming language |
| **Flask** | Web framework for API |
| **PyPDF2** | PDF manipulation |
| **Pillow** | Image processing |
| **pytesseract** | OCR engine wrapper |
| **transformers** | HuggingFace AI models |

---

# 3. COMPLETE FOLDER STRUCTURE

```
docushrink-ai/
│
├── index.html                 # Entry HTML file
├── package.json               # NPM dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── vite.config.ts             # Vite build configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── postcss.config.js          # PostCSS configuration
├── vite-env.d.ts              # Vite environment type definitions
│
├── src/                       # Source code directory
│   │
│   ├── main.tsx               # React entry point
│   ├── App.tsx                # Main application component
│   ├── index.css              # Global styles
│   │
│   ├── components/            # Feature components (10 widgets)
│   │   ├── Summarizer.tsx
│   │   ├── KeywordExtractor.tsx
│   │   ├── QuestionGenerator.tsx
│   │   ├── BulletGenerator.tsx
│   │   ├── OCR.tsx
│   │   ├── PdfCompressor.tsx
│   │   ├── ImageCompressor.tsx
│   │   ├── SplitPdf.tsx
│   │   ├── SplitMany.tsx
│   │   └── MergePdf.tsx
│   │
│   ├── services/              # Business logic services
│   │   ├── aiService.ts
│   │   ├── pdfService.ts
│   │   ├── imageService.ts
│   │   ├── ocrService.ts
│   │   └── apiService.ts
│   │
│   └── ui/                    # Reusable UI components
│       ├── Button.tsx
│       ├── Slider.tsx
│       ├── Dropzone.tsx
│       └── Toast.tsx
│
├── backend/                   # Python backend (optional)
│   ├── app.py
│   ├── requirements.txt
│   │
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── ai_routes.py
│   │   ├── pdf_routes.py
│   │   ├── image_routes.py
│   │   └── ocr_routes.py
│   │
│   └── services/
│       ├── __init__.py
│       ├── ai_service.py
│       ├── pdf_service.py
│       ├── image_service.py
│       └── ocr_service.py
│
├── README.md                  # Project readme
└── PROJECT_DOCUMENTATION.md   # This file
```

---

# 4. FILE-BY-FILE EXPLANATION

## 4.1 ROOT CONFIGURATION FILES

### index.html
```
PURPOSE: Entry point HTML file that loads the React application
WHY REQUIRED: Every web application needs an HTML file as the starting point.
              The browser loads this file first, which then loads JavaScript.

CONTAINS:
- HTML5 doctype declaration
- Meta tags for viewport and character encoding
- Title tag for browser tab name
- Root div element where React renders
- Script tag to load main.tsx
```

### package.json
```
PURPOSE: Defines project metadata, dependencies, and scripts
WHY REQUIRED: NPM (Node Package Manager) uses this file to:
              - Know which packages to install
              - Define runnable scripts (npm run dev, npm run build)
              - Store project version and name

KEY SECTIONS:
- "dependencies": Libraries needed for production
- "devDependencies": Libraries needed only for development
- "scripts": Command shortcuts (dev, build, preview)
```

### tsconfig.json
```
PURPOSE: Configures TypeScript compiler options
WHY REQUIRED: Tells TypeScript how to compile .ts/.tsx files to JavaScript

KEY OPTIONS:
- "target": Which JavaScript version to compile to
- "jsx": How to handle JSX syntax
- "strict": Enable all strict type checking
- "moduleResolution": How to find imported modules
```

### vite.config.ts
```
PURPOSE: Configures Vite build tool
WHY REQUIRED: Customizes how Vite bundles the application

CONTAINS:
- React plugin configuration
- Build output settings
- Development server settings
```

### tailwind.config.js
```
PURPOSE: Configures Tailwind CSS framework
WHY REQUIRED: Tells Tailwind which files to scan for CSS classes

CONTAINS:
- Content paths (which files use Tailwind classes)
- Theme extensions (custom colors, spacing)
- Plugin configurations
```

---

## 4.2 SOURCE FILES (src/)

### src/main.tsx
```
PURPOSE: React application entry point
WHY REQUIRED: Initializes React and mounts the App component to DOM

WHAT IT DOES:
1. Imports React and ReactDOM
2. Imports the root App component
3. Imports global CSS
4. Renders App inside the #root div element

CODE FLOW:
index.html → main.tsx → App.tsx → All other components
```

### src/App.tsx
```
PURPOSE: Main application component with layout and navigation
WHY REQUIRED: Acts as the container for all features and manages:
              - Sidebar navigation
              - Dark/Light mode
              - Active feature switching
              - Mobile responsiveness

KEY FEATURES:
1. Sidebar with 10 navigation items
2. Dark mode toggle with localStorage persistence
3. Mobile hamburger menu
4. Dynamic component rendering based on active tab
5. Toast notification system

STATE VARIABLES:
- activeTab: Which feature is currently shown
- darkMode: Boolean for theme
- sidebarOpen: Boolean for mobile menu
- toast: Object for notification messages

FUNCTIONS:
- toggleDarkMode(): Switches theme and saves to localStorage
- showToast(): Displays notification messages
- renderContent(): Returns the active feature component
```

### src/index.css
```
PURPOSE: Global CSS styles and Tailwind imports
WHY REQUIRED: Defines base styles, custom utilities, and animations

CONTAINS:
1. Tailwind base imports (@import "tailwindcss")
2. Custom dark mode variant (@custom-variant dark)
3. Custom CSS variables for colors
4. Animation keyframes (fadeIn, slideIn, spin)
5. Custom scrollbar styles
6. Glassmorphism effects
```

---

## 4.3 COMPONENT FILES (src/components/)

### Summarizer.tsx
```
PURPOSE: AI-powered text summarization widget
WHY REQUIRED: Allows users to condense long text into key sentences

HOW IT WORKS:
1. User inputs text or uploads PDF
2. Clicks "Summarize" button
3. aiService.summarize() processes the text
4. Displays shortened version with compression stats

ALGORITHM: Extractive summarization
- Splits text into sentences
- Scores each sentence by word importance
- Selects top-scoring sentences
- Returns them in original order

KEY FUNCTIONS:
- handleSummarize(): Orchestrates the summarization process
- handleFileUpload(): Extracts text from uploaded PDF

PROPS/STATE:
- text: Input text content
- summary: Output summarized text
- ratio: Compression ratio (0.1 to 0.9)
- loading: Processing state
- stats: Word/sentence count statistics
```

### KeywordExtractor.tsx
```
PURPOSE: Extracts important keywords from text using TF-IDF
WHY REQUIRED: Helps users identify key topics in documents

ALGORITHM: TF-IDF (Term Frequency - Inverse Document Frequency)
- TF: How often a word appears in the document
- IDF: How rare the word is across all documents
- Score = TF × IDF (higher = more important)

KEY FUNCTIONS:
- handleExtract(): Runs keyword extraction
- calculateTFIDF(): Computes word importance scores

OUTPUT: List of keywords with importance scores (0-100)
```

### QuestionGenerator.tsx
```
PURPOSE: Generates questions from text content
WHY REQUIRED: Useful for studying, creating quizzes, or comprehension testing

ALGORITHM: Pattern-based extraction
1. Identifies sentences with key patterns (definitions, facts)
2. Converts statements to questions
3. Detects "is", "are", "was", "were" for what/who questions
4. Detects numbers for "how many" questions
5. Detects dates/times for "when" questions

QUESTION TYPES GENERATED:
- What is/are questions
- Who questions (for people)
- When questions (for dates)
- How many questions (for numbers)
- Why questions (for because/since sentences)
```

### BulletGenerator.tsx
```
PURPOSE: Converts paragraphs to bullet points
WHY REQUIRED: Creates structured summaries for presentations/notes

ALGORITHM:
1. Splits text into sentences
2. Removes filler words and redundancy
3. Shortens each sentence to key phrase
4. Formats as bullet list

OUTPUT FORMAT:
• First key point
• Second key point
• Third key point
```

### OCR.tsx
```
PURPOSE: Extracts text from images using Tesseract.js
WHY REQUIRED: Digitizes printed/handwritten text from photos

SUPPORTED LANGUAGES (13):
English, Spanish, French, German, Italian, Portuguese,
Russian, Chinese (Simplified & Traditional), Japanese,
Korean, Arabic, Hindi

HOW IT WORKS:
1. User uploads image (JPG, PNG, etc.)
2. Selects target language
3. Tesseract.js processes image
4. Returns extracted text with confidence score

KEY FUNCTIONS:
- handleOCR(): Runs OCR processing
- ocrService.extractText(): Tesseract.js wrapper
```

### PdfCompressor.tsx
```
PURPOSE: Reduces PDF file size to user-specified target
WHY REQUIRED: Large PDFs are hard to email/upload

TARGET SIZE INPUT:
- User enters desired size (e.g., "500 KB" or "2 MB")
- System compresses to match target

COMPRESSION TECHNIQUES:
1. Removes metadata
2. Optimizes internal structure
3. Reduces image quality within PDF
4. Removes duplicate resources

KEY FUNCTIONS:
- parseTargetSize(): Converts "500 KB" to bytes
- handleCompress(): Runs compression process
```

### ImageCompressor.tsx
```
PURPOSE: Reduces image file size to target KB/MB
WHY REQUIRED: Large images slow down websites and fill storage

FEATURES:
- Target size in KB or MB
- Format conversion (JPEG, PNG, WebP)
- Maintains aspect ratio
- Shows before/after comparison

ALGORITHM:
1. Load image into canvas
2. Binary search for quality level
3. Reduce dimensions if needed
4. Export in selected format

KEY FUNCTIONS:
- compressToTargetSize(): Iteratively adjusts quality
- handleCompress(): Main compression orchestrator
```

### SplitPdf.tsx
```
PURPOSE: Extracts specific pages from a PDF
WHY REQUIRED: Extract only needed pages without full document

PAGE RANGE FORMAT:
- "1-5" → Pages 1 through 5
- "1,3,5" → Pages 1, 3, and 5
- "1-3,7,9-12" → Complex ranges

KEY FUNCTIONS:
- parsePageRange(): Converts string to page numbers
- handleSplit(): Extracts specified pages
- pdfService.splitPdf(): pdf-lib operations
```

### SplitMany.tsx
```
PURPOSE: Splits one PDF into multiple separate PDFs
WHY REQUIRED: Create individual files from combined document

SPLIT MODES:
1. Each page as separate PDF
2. Split into chunks (e.g., every 5 pages)

OUTPUT: ZIP file containing all split PDFs

KEY FUNCTIONS:
- handleSplit(): Orchestrates splitting process
- pdfService.splitToMany(): Creates multiple PDFs
- Creates ZIP using jszip library
```

### MergePdf.tsx
```
PURPOSE: Combines multiple PDFs into one document
WHY REQUIRED: Consolidate multiple documents for submission

FEATURES:
- Drag to reorder PDFs
- Preview each PDF info
- Remove individual files
- See total page count

KEY FUNCTIONS:
- moveUp()/moveDown(): Reorder files
- handleMerge(): Combines all PDFs
- pdfService.mergePdfs(): pdf-lib merge operation
```

---

## 4.4 SERVICE FILES (src/services/)

### aiService.ts
```
PURPOSE: Contains all AI/NLP processing algorithms
WHY REQUIRED: Separates business logic from UI components

FUNCTIONS:

1. extractTextFromPdf(file: File): Promise<string>
   - Uses pdfjs-dist library
   - Loads PDF and extracts text from each page
   - Returns combined text string

2. summarize(text: string, ratio: number): Promise<object>
   - Extractive summarization algorithm
   - Steps:
     a. Split text into sentences
     b. Calculate word frequencies
     c. Score sentences by word importance
     d. Select top sentences based on ratio
     e. Return in original order
   - Returns: { summary, originalWords, summaryWords, reduction }

3. extractKeywords(text: string, count: number): Promise<array>
   - TF-IDF algorithm implementation
   - Steps:
     a. Tokenize text into words
     b. Remove stopwords (the, is, at, etc.)
     c. Calculate term frequency
     d. Apply IDF weighting
     e. Sort by score
   - Returns: [{ word, score }, ...]

4. generateQuestions(text: string, count: number): Promise<array>
   - Pattern-based question generation
   - Detects: definitions, facts, numbers, dates
   - Transforms statements to questions
   - Returns: ["Question 1?", "Question 2?", ...]

5. generateBullets(text: string, count: number): Promise<array>
   - Sentence extraction and simplification
   - Removes filler phrases
   - Returns: ["Point 1", "Point 2", ...]

HELPER FUNCTIONS:
- splitIntoSentences(text): Splits on . ! ?
- getWordFrequency(text): Counts word occurrences
- removeStopwords(words): Filters common words
```

### pdfService.ts
```
PURPOSE: All PDF manipulation operations
WHY REQUIRED: Centralizes PDF processing logic

FUNCTIONS:

1. compressPdf(file: File, targetBytes: number): Promise<Blob>
   - Loads PDF with pdf-lib
   - Removes metadata
   - Optimizes structure
   - Returns compressed PDF blob

2. splitPdf(file: File, pageNumbers: number[]): Promise<Blob>
   - Extracts specified pages
   - Creates new PDF with only those pages
   - Returns new PDF blob

3. splitToMany(file: File, pagesPerFile: number): Promise<Blob[]>
   - Divides PDF into chunks
   - Creates separate PDF for each chunk
   - Returns array of PDF blobs

4. mergePdfs(files: File[]): Promise<Blob>
   - Loads all input PDFs
   - Copies pages in order
   - Returns single merged PDF blob

5. getPdfInfo(file: File): Promise<object>
   - Extracts PDF metadata
   - Returns: { pageCount, title, author, fileSize }

LIBRARY USED: pdf-lib
- Pure JavaScript PDF library
- No server required
- Handles create, modify, merge, split
```

### imageService.ts
```
PURPOSE: Image compression and conversion
WHY REQUIRED: Client-side image optimization

FUNCTIONS:

1. compressImage(file: File, targetBytes: number, format: string): Promise<Blob>
   - Uses HTML5 Canvas API
   - Binary search for optimal quality
   - Steps:
     a. Load image into Image element
     b. Draw on canvas
     c. Export with quality setting
     d. Check size, adjust quality
     e. Repeat until target reached
   - Returns compressed image blob

2. resizeImage(file: File, maxWidth: number, maxHeight: number): Promise<Blob>
   - Scales image maintaining aspect ratio
   - Uses canvas drawImage with new dimensions

3. convertFormat(file: File, format: string): Promise<Blob>
   - Converts between JPEG, PNG, WebP
   - Uses canvas.toBlob() with mime type

TECHNIQUE: Binary search compression
- Start with quality = 0.5
- If too big, reduce quality
- If too small, increase quality
- Repeat until within tolerance
```

### ocrService.ts
```
PURPOSE: Optical Character Recognition using Tesseract.js
WHY REQUIRED: Extract text from images

FUNCTIONS:

1. extractText(file: File, language: string): Promise<object>
   - Initializes Tesseract worker
   - Loads language data
   - Processes image
   - Returns: { text, confidence, words }

2. getSupportedLanguages(): string[]
   - Returns list of 13 supported languages
   - Each with language code and display name

HOW TESSERACT.JS WORKS:
1. Creates Web Worker (background thread)
2. Downloads language training data
3. Preprocesses image (binarization, deskew)
4. Runs character recognition
5. Returns text with confidence scores

LANGUAGE CODES:
- eng: English
- spa: Spanish
- fra: French
- deu: German
- chi_sim: Chinese Simplified
- jpn: Japanese
- kor: Korean
- ara: Arabic
- hin: Hindi
```

### apiService.ts
```
PURPOSE: HTTP client for backend API communication
WHY REQUIRED: Connects frontend to Python backend (when used)

FUNCTIONS:

1. summarize(text: string, ratio: number): Promise<object>
   - POST /api/ai/summarize

2. extractKeywords(text: string, count: number): Promise<array>
   - POST /api/ai/keywords

3. generateQuestions(text: string, count: number): Promise<array>
   - POST /api/ai/questions

4. generateBullets(text: string, count: number): Promise<array>
   - POST /api/ai/bullets

5. compressPdf(file: File, targetSize: number): Promise<Blob>
   - POST /api/pdf/compress (multipart/form-data)

6. compressImage(file: File, targetSize: number): Promise<Blob>
   - POST /api/image/compress (multipart/form-data)

7. ocr(file: File, language: string): Promise<object>
   - POST /api/ocr (multipart/form-data)

NOTE: This service is OPTIONAL. Frontend works standalone
      using client-side services. API service is used only
      when backend is running for enhanced AI models.
```

---

## 4.5 UI COMPONENT FILES (src/ui/)

### Button.tsx
```
PURPOSE: Reusable styled button component
WHY REQUIRED: Consistent button styling across application

PROPS:
- children: Button text/content
- onClick: Click handler function
- variant: 'primary' | 'secondary' | 'danger'
- size: 'sm' | 'md' | 'lg'
- disabled: Boolean to disable button
- loading: Boolean to show spinner
- icon: Optional icon component
- fullWidth: Boolean for full width

VARIANTS:
- primary: Blue gradient, main actions
- secondary: Gray, secondary actions
- danger: Red, destructive actions

FEATURES:
- Loading spinner animation
- Disabled state styling
- Hover/focus effects
- Icon support
```

### Slider.tsx
```
PURPOSE: Range input with visual feedback
WHY REQUIRED: Select values within a range (e.g., compression ratio)

PROPS:
- value: Current value
- onChange: Value change handler
- min: Minimum value
- max: Maximum value
- step: Increment step
- label: Display label
- showValue: Show current value

FEATURES:
- Custom styled track and thumb
- Value display
- Smooth sliding
- Touch support for mobile
```

### Dropzone.tsx
```
PURPOSE: Drag-and-drop file upload area
WHY REQUIRED: User-friendly file selection

PROPS:
- onFilesSelected: Callback when files chosen
- accept: Accepted file types (e.g., ".pdf,.jpg")
- multiple: Allow multiple files
- maxSize: Maximum file size in bytes
- value: Controlled file list

FEATURES:
- Drag and drop support
- Click to browse
- File type validation
- Size validation
- Preview of selected files
- Remove individual files
- Clear all button

STATES:
- isDragging: Visual feedback when dragging over
- files: Internal file list

EVENTS HANDLED:
- onDragEnter: Start drag visual
- onDragLeave: End drag visual
- onDragOver: Prevent default
- onDrop: Handle dropped files
- onClick: Open file browser
```

### Toast.tsx
```
PURPOSE: Notification popup messages
WHY REQUIRED: User feedback for actions (success, error, info)

PROPS:
- message: Text to display
- type: 'success' | 'error' | 'info' | 'warning'
- onClose: Callback when dismissed
- duration: Auto-dismiss time (ms)

FEATURES:
- Auto-dismiss after duration
- Manual close button
- Color-coded by type
- Slide-in animation
- Icon by type

TYPES:
- success: Green, checkmark icon
- error: Red, X icon
- info: Blue, info icon
- warning: Yellow, warning icon
```

---

## 4.6 BACKEND FILES (backend/)

### app.py
```
PURPOSE: Flask application entry point
WHY REQUIRED: Initializes and runs the Python web server

WHAT IT DOES:
1. Creates Flask application instance
2. Configures CORS (Cross-Origin Resource Sharing)
3. Registers route blueprints
4. Configures upload folder
5. Starts development server

KEY CONFIGURATIONS:
- CORS enabled for frontend access
- Upload folder for temporary files
- Max file size limit
- JSON response formatting
```

### routes/ai_routes.py
```
PURPOSE: API endpoints for AI text processing
WHY REQUIRED: Handles HTTP requests for AI features

ENDPOINTS:
- POST /api/ai/summarize
- POST /api/ai/keywords
- POST /api/ai/questions
- POST /api/ai/bullets

EACH ENDPOINT:
1. Receives JSON data
2. Validates input
3. Calls appropriate service function
4. Returns JSON response
```

### routes/pdf_routes.py
```
PURPOSE: API endpoints for PDF operations
WHY REQUIRED: Handles PDF file processing requests

ENDPOINTS:
- POST /api/pdf/compress
- POST /api/pdf/split
- POST /api/pdf/split-many
- POST /api/pdf/merge

HANDLES:
- Multipart file uploads
- File validation
- Temporary file management
- Binary response (PDF bytes)
```

### routes/image_routes.py
```
PURPOSE: API endpoint for image compression
WHY REQUIRED: Server-side image processing

ENDPOINT:
- POST /api/image/compress

ACCEPTS:
- Image file (multipart)
- Target size parameter
- Format parameter
```

### routes/ocr_routes.py
```
PURPOSE: API endpoint for OCR processing
WHY REQUIRED: Server-side OCR with pytesseract

ENDPOINT:
- POST /api/ocr

ACCEPTS:
- Image file
- Language parameter

RETURNS:
- Extracted text
- Confidence score
```

### services/ai_service.py
```
PURPOSE: Python AI processing functions
WHY REQUIRED: Server-side NLP with optional transformers

FUNCTIONS:
- summarize_text(): Uses NLTK or transformers
- extract_keywords(): TF-IDF with scikit-learn
- generate_questions(): Pattern matching
- generate_bullets(): Text extraction

LIBRARIES USED:
- nltk: Natural Language Toolkit
- transformers: HuggingFace models (optional)
- scikit-learn: TF-IDF vectorizer
```

### services/pdf_service.py
```
PURPOSE: Python PDF processing functions
WHY REQUIRED: Server-side PDF manipulation

FUNCTIONS:
- compress_pdf(): Reduces file size
- split_pdf(): Extracts pages
- split_to_many(): Creates multiple PDFs
- merge_pdfs(): Combines PDFs

LIBRARIES USED:
- PyPDF2: PDF manipulation
- pikepdf: PDF optimization
```

### services/image_service.py
```
PURPOSE: Python image processing functions
WHY REQUIRED: Server-side image compression

FUNCTIONS:
- compress_image(): Pillow-based compression
- resize_image(): Dimension scaling
- convert_format(): Format conversion

LIBRARIES USED:
- Pillow (PIL): Image processing
```

### services/ocr_service.py
```
PURPOSE: Python OCR processing
WHY REQUIRED: Server-side text extraction

FUNCTIONS:
- extract_text(): pytesseract wrapper
- preprocess_image(): Image enhancement

LIBRARIES USED:
- pytesseract: Tesseract OCR wrapper
- Pillow: Image preprocessing
```

### requirements.txt
```
PURPOSE: Python package dependencies
WHY REQUIRED: pip uses this to install packages

PACKAGES:
- flask: Web framework
- flask-cors: CORS support
- PyPDF2: PDF handling
- Pillow: Image processing
- pytesseract: OCR
- transformers: AI models
- torch: PyTorch (for transformers)
- nltk: NLP toolkit
- scikit-learn: ML utilities
```

---

# 5. ALL FUNCTIONS EXPLAINED

## AI Service Functions

### summarize(text, ratio)
```
INPUT:
- text: String of text to summarize
- ratio: Number between 0.1 and 0.9 (compression level)

ALGORITHM:
1. Split text into sentences using regex
2. Count frequency of each word
3. Score each sentence = sum of word frequencies
4. Sort sentences by score (highest first)
5. Take top N sentences (N = total × ratio)
6. Reorder selected sentences to original order
7. Join sentences into summary

OUTPUT:
{
  summary: "Summarized text...",
  originalWords: 500,
  summaryWords: 150,
  reduction: 70
}

EXAMPLE:
Input: "The cat sat on the mat. The mat was red. The cat was happy."
Ratio: 0.5
Output: "The cat sat on the mat. The cat was happy."
```

### extractKeywords(text, count)
```
INPUT:
- text: String of text
- count: Number of keywords to extract

ALGORITHM (TF-IDF):
1. Tokenize: Split text into words
2. Normalize: Convert to lowercase
3. Filter: Remove stopwords (the, is, a, an, etc.)
4. Count: Calculate term frequency (TF)
   TF = (times word appears) / (total words)
5. Weight: Apply IDF (rarer words score higher)
   IDF = log(total documents / documents with word)
6. Score: TF × IDF
7. Sort: By score descending
8. Return: Top N words with scores

OUTPUT:
[
  { word: "algorithm", score: 95 },
  { word: "processing", score: 82 },
  { word: "document", score: 78 }
]
```

### generateQuestions(text, count)
```
INPUT:
- text: String of text
- count: Number of questions to generate

ALGORITHM:
1. Split into sentences
2. For each sentence, detect patterns:
   - "X is Y" → "What is X?"
   - "X was Y" → "What was X?"
   - Contains number → "How many...?"
   - Contains date → "When...?"
   - Contains name → "Who...?"
3. Transform to question format
4. Return top N questions

OUTPUT:
[
  "What is machine learning?",
  "When was the algorithm developed?",
  "How many documents were processed?"
]
```

### generateBullets(text, count)
```
INPUT:
- text: String of text
- count: Number of bullet points

ALGORITHM:
1. Split into sentences
2. Score by importance (similar to summarize)
3. For each top sentence:
   - Remove filler phrases ("It is important to note that")
   - Trim to essential phrase
   - Capitalize first letter
4. Return as bullet points

OUTPUT:
[
  "Machine learning automates data analysis",
  "Neural networks mimic brain structure",
  "Training requires large datasets"
]
```

## PDF Service Functions

### compressPdf(file, targetBytes)
```
INPUT:
- file: PDF File object
- targetBytes: Target size in bytes

PROCESS:
1. Load PDF with pdf-lib
2. Get all pages
3. For each page:
   - Compress embedded images
   - Remove annotations (optional)
4. Remove metadata
5. Serialize with compression
6. Check size, adjust if needed

OUTPUT: Compressed PDF as Blob
```

### splitPdf(file, pageNumbers)
```
INPUT:
- file: PDF File object
- pageNumbers: Array of page numbers [1, 2, 5, 7]

PROCESS:
1. Load source PDF
2. Create new empty PDF
3. For each page number:
   - Copy page from source
   - Add to new PDF
4. Save new PDF

OUTPUT: New PDF with only specified pages
```

### mergePdfs(files)
```
INPUT:
- files: Array of PDF File objects

PROCESS:
1. Create new empty PDF
2. For each file in order:
   - Load PDF
   - Copy all pages
   - Add to new PDF
3. Save merged PDF

OUTPUT: Single PDF containing all pages
```

## Image Service Functions

### compressImage(file, targetBytes, format)
```
INPUT:
- file: Image File object
- targetBytes: Target size in bytes
- format: "jpeg" | "png" | "webp"

ALGORITHM (Binary Search):
1. Set quality range: min=0.1, max=1.0
2. Load image into canvas
3. While not at target size:
   a. quality = (min + max) / 2
   b. Export with quality
   c. If size > target: max = quality
   d. If size < target: min = quality
   e. If within 5% of target: done
4. If still too big, reduce dimensions
5. Repeat until target achieved

OUTPUT: Compressed image as Blob
```

## OCR Service Functions

### extractText(file, language)
```
INPUT:
- file: Image File object
- language: Language code ("eng", "spa", etc.)

PROCESS:
1. Create Tesseract worker
2. Load language data
3. Preprocess image:
   - Convert to grayscale
   - Apply threshold
   - Deskew if needed
4. Run recognition
5. Get text and confidence

OUTPUT:
{
  text: "Extracted text content...",
  confidence: 94.5,
  words: [{ text: "word", confidence: 98 }, ...]
}
```

---

# 6. DATA FLOW DIAGRAMS

## Overall Application Flow
```
┌─────────────────────────────────────────────────────────────┐
│                         USER                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      BROWSER (Frontend)                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                     App.tsx                          │   │
│  │  - Sidebar Navigation                                │   │
│  │  - Dark/Light Mode                                   │   │
│  │  - Active Component Switching                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                              │                              │
│              ┌───────────────┼───────────────┐              │
│              ▼               ▼               ▼              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │  Summarizer  │ │ PDFCompress  │ │     OCR      │        │
│  │  Component   │ │  Component   │ │  Component   │  ...   │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│              │               │               │              │
│              ▼               ▼               ▼              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │  aiService   │ │  pdfService  │ │  ocrService  │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│              │               │               │              │
│              ▼               ▼               ▼              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Processing Libraries                    │   │
│  │  - pdf-lib (PDF manipulation)                        │   │
│  │  - pdfjs-dist (PDF text extraction)                  │   │
│  │  - tesseract.js (OCR)                                │   │
│  │  - Canvas API (Image processing)                     │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    OUTPUT TO USER                           │
│  - Processed text                                           │
│  - Downloaded files                                         │
│  - ZIP archives                                             │
└─────────────────────────────────────────────────────────────┘
```

## Summarization Flow
```
┌──────────┐    ┌─────────────┐    ┌─────────────┐    ┌──────────┐
│  User    │───▶│  Summarizer │───▶│  aiService  │───▶│  Output  │
│  Input   │    │  Component  │    │  .summarize │    │  Display │
└──────────┘    └─────────────┘    └─────────────┘    └──────────┘
     │                │                   │                │
     │                │                   │                │
     ▼                ▼                   ▼                ▼
 Text or PDF    State Update      Algorithm:          Summary +
                (loading=true)    1. Sentences        Statistics
                                  2. Word Freq
                                  3. Score
                                  4. Select Top
```

## PDF Compression Flow
```
┌──────────┐    ┌─────────────┐    ┌─────────────┐    ┌──────────┐
│  Upload  │───▶│ PDFCompress │───▶│  pdfService │───▶│ Download │
│  PDF     │    │  Component  │    │  .compress  │    │  Link    │
└──────────┘    └─────────────┘    └─────────────┘    └──────────┘
     │                │                   │                │
     │                │                   │                │
     ▼                ▼                   ▼                ▼
 File Object    Target Size          pdf-lib:          Blob URL
 (5 MB)         Input (500 KB)       1. Load           for download
                                     2. Optimize
                                     3. Serialize
```

## OCR Processing Flow
```
┌──────────┐    ┌─────────────┐    ┌─────────────┐    ┌──────────┐
│  Upload  │───▶│     OCR     │───▶│  ocrService │───▶│  Text    │
│  Image   │    │  Component  │    │  .extract   │    │  Output  │
└──────────┘    └─────────────┘    └─────────────┘    └──────────┘
     │                │                   │                │
     │                │                   │                │
     ▼                ▼                   ▼                ▼
 JPG/PNG         Language           Tesseract.js:     Extracted
 File            Selection          1. Worker Init    Text +
                 (English)          2. Load Lang      Confidence
                                    3. Recognize
```

---

# 7. WHY EACH FILE IS REQUIRED

## Configuration Files

| File | Why Required |
|------|--------------|
| `index.html` | Browser entry point - loads the React app |
| `package.json` | Defines dependencies and npm scripts |
| `tsconfig.json` | TypeScript needs configuration to compile |
| `vite.config.ts` | Vite build tool configuration |
| `tailwind.config.js` | Tailwind CSS needs to know which files to scan |
| `postcss.config.js` | PostCSS processes Tailwind directives |

## Source Files

| File | Why Required |
|------|--------------|
| `main.tsx` | React needs entry point to mount App |
| `App.tsx` | Main layout, navigation, state management |
| `index.css` | Global styles, Tailwind imports, animations |

## Component Files

| File | Why Required |
|------|--------------|
| `Summarizer.tsx` | User interface for text summarization |
| `KeywordExtractor.tsx` | User interface for keyword extraction |
| `QuestionGenerator.tsx` | User interface for question generation |
| `BulletGenerator.tsx` | User interface for bullet point generation |
| `OCR.tsx` | User interface for OCR processing |
| `PdfCompressor.tsx` | User interface for PDF compression |
| `ImageCompressor.tsx` | User interface for image compression |
| `SplitPdf.tsx` | User interface for PDF splitting |
| `SplitMany.tsx` | User interface for multi-PDF splitting |
| `MergePdf.tsx` | User interface for PDF merging |

## Service Files

| File | Why Required |
|------|--------------|
| `aiService.ts` | Separates AI logic from UI - reusable, testable |
| `pdfService.ts` | Separates PDF logic from UI - reusable, testable |
| `imageService.ts` | Separates image logic from UI - reusable, testable |
| `ocrService.ts` | Separates OCR logic from UI - reusable, testable |
| `apiService.ts` | Abstracts backend communication - switchable |

## UI Component Files

| File | Why Required |
|------|--------------|
| `Button.tsx` | Consistent button styling across app |
| `Slider.tsx` | Reusable range input component |
| `Dropzone.tsx` | Reusable file upload component |
| `Toast.tsx` | Reusable notification component |

## Why Separate Components and Services?

1. **Separation of Concerns**
   - UI components handle display
   - Services handle business logic
   - Easy to modify one without affecting other

2. **Reusability**
   - Services can be used by multiple components
   - UI components can be reused

3. **Testability**
   - Services can be unit tested independently
   - Components can be tested with mock services

4. **Maintainability**
   - Clear file organization
   - Easy to find and fix issues
   - New developers understand structure quickly

---

# 8. API ENDPOINTS

## Frontend-Only Mode (No Backend)
All processing happens in browser using JavaScript libraries.
No API calls needed.

## With Backend Mode

### AI Endpoints

| Endpoint | Method | Body | Response |
|----------|--------|------|----------|
| `/api/ai/summarize` | POST | `{text, ratio}` | `{summary, stats}` |
| `/api/ai/keywords` | POST | `{text, count}` | `[{word, score}]` |
| `/api/ai/questions` | POST | `{text, count}` | `[questions]` |
| `/api/ai/bullets` | POST | `{text, count}` | `[bullets]` |

### Document Endpoints

| Endpoint | Method | Body | Response |
|----------|--------|------|----------|
| `/api/pdf/compress` | POST | FormData(file, targetSize) | PDF binary |
| `/api/pdf/split` | POST | FormData(file, pages) | PDF binary |
| `/api/pdf/split-many` | POST | FormData(file, pagesPerFile) | ZIP binary |
| `/api/pdf/merge` | POST | FormData(files[]) | PDF binary |
| `/api/image/compress` | POST | FormData(file, targetSize, format) | Image binary |
| `/api/ocr` | POST | FormData(file, language) | `{text, confidence}` |

---

# 9. HOW TO RUN

## Quick Start (Frontend Only)

```bash
# Step 1: Install dependencies
npm install

# Step 2: Start development server
npm run dev

# Step 3: Open browser
# Go to http://localhost:5173
```

## Full Stack (Frontend + Backend)

### Terminal 1: Frontend
```bash
npm install
npm run dev
```

### Terminal 2: Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

## Production Build

```bash
# Build frontend
npm run build

# Output in dist/ folder
# Serve with any static file server
```

---

# 10. INTERVIEW QUESTIONS & ANSWERS

## Q1: What is the purpose of this project?
**Answer:** DocuShrink AI is a web-based document processing system that provides 10 AI-powered tools for processing PDFs, images, and text. It runs entirely in the browser for privacy, requires no API keys, and can work offline after initial load.

## Q2: Why did you choose React for the frontend?
**Answer:** React provides:
- Component-based architecture for modular code
- Virtual DOM for efficient updates
- Large ecosystem of libraries
- TypeScript support for type safety
- Easy state management with hooks

## Q3: Why use client-side processing instead of server?
**Answer:**
- **Privacy**: Files never leave user's device
- **Speed**: No upload/download time
- **Cost**: No server costs
- **Offline**: Works without internet
- **Scalability**: No server load

## Q4: Explain the TF-IDF algorithm you used.
**Answer:** TF-IDF (Term Frequency-Inverse Document Frequency) identifies important words:
- **TF**: How often a word appears in the document (more = important)
- **IDF**: How rare the word is across documents (rarer = more specific)
- **Score**: TF × IDF gives final importance
- Common words like "the" score low (high TF but low IDF)
- Specific terms score high (medium TF but high IDF)

## Q5: How does the PDF compression work?
**Answer:** PDF compression uses pdf-lib library to:
1. Parse the PDF structure
2. Remove unnecessary metadata
3. Optimize internal object references
4. Re-encode with compression
5. Iterate to reach target size

## Q6: What is OCR and how did you implement it?
**Answer:** OCR (Optical Character Recognition) extracts text from images. I used Tesseract.js which:
1. Creates a Web Worker for background processing
2. Downloads trained language data
3. Preprocesses the image (binarization)
4. Runs neural network recognition
5. Returns text with confidence scores

## Q7: Why separate services from components?
**Answer:** Separation of concerns:
- Components handle UI (what user sees)
- Services handle logic (what happens)
- Easy to test services independently
- Can swap implementations (client-side vs API)
- Multiple components can share services

## Q8: How does dark mode work?
**Answer:**
1. Toggle button changes `darkMode` state
2. State saved to localStorage for persistence
3. `dark` class added to `<html>` element
4. Tailwind's dark variant applies dark styles
5. CSS variables change colors accordingly

## Q9: What libraries did you use and why?

| Library | Purpose | Why Chosen |
|---------|---------|------------|
| pdf-lib | PDF manipulation | Pure JS, no dependencies |
| pdfjs-dist | PDF text extraction | Mozilla's official library |
| tesseract.js | OCR | Industry standard, 100+ languages |
| jszip | ZIP creation | Lightweight, browser-compatible |
| file-saver | Downloads | Cross-browser download handling |

## Q10: How would you improve this project?
**Answer:**
1. Add WebAssembly for faster processing
2. Implement progressive loading for large files
3. Add batch processing for multiple files
4. Implement undo/redo functionality
5. Add cloud sync (optional)
6. Add more AI models via WebML

---

# CONCLUSION

DocuShrink AI demonstrates:
- Modern React development practices
- TypeScript for type safety
- Client-side processing for privacy
- Modular architecture for maintainability
- Responsive UI with dark mode
- Multiple AI/ML algorithms

The project is production-ready and can be deployed to any static hosting service (Netlify, Vercel, GitHub Pages) without requiring a backend server.

---

*Documentation generated for DocuShrink AI v1.0*
*Total Files: 30+ | Total Lines of Code: 5000+*
