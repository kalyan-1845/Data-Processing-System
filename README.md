# DocuShrink AI – Smart Document Processing System

A complete, production-ready web application for AI-powered document processing. **Works 100% in the browser - no server needed!**

## 🚀 Quick Start (One Line)

```bash
npm install && npm run dev
```

That's it! Open http://localhost:5173 and start processing documents.

---

## ✨ Features (10 AI-Powered Modules)

### 🤖 AI Text Tools
| Module | Description |
|--------|-------------|
| **AI Summarizer** | Extract key points from documents |
| **Keyword Extractor** | TF-IDF based keyword extraction |
| **Question Generator** | Generate study questions from text |
| **Bullet Generator** | Convert text to bullet points |
| **OCR Extractor** | Extract text from images (13 languages) |

### 📄 Document Tools
| Module | Description |
|--------|-------------|
| **PDF Compressor** | Compress to YOUR target size (KB/MB) |
| **Image Compressor** | Compress to YOUR target size (KB/MB) |
| **Split & Extract** | Extract pages (e.g., 1-3,5,7-9) |
| **One → Many PDFs** | Split PDF into separate files (ZIP) |
| **Merge PDFs** | Combine multiple PDFs |

---

## 🎯 Key Features

### Target Size Compression
- **YOU set the target file size** in KB or MB
- Automatic quality adjustment to hit your target
- Works for both PDF and images

### Premium UI
- ✅ Dark / Light mode (auto-detects system)
- ✅ Drag & Drop file uploads
- ✅ Progress bars for long operations
- ✅ Toast notifications
- ✅ Mobile responsive
- ✅ Glassmorphism design

### Privacy First
- 🔒 100% client-side processing
- 🔒 Files never leave your device
- 🔒 No server uploads
- 🔒 No API keys needed

---

## 🛠️ Run in VS Code

### Frontend Only (Recommended)
```bash
npm install && npm run dev
```

### With Python Backend (Optional)
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
cd backend
pip install -r requirements.txt
python app.py
```

### Or use the combined start:
```bash
npm run start
```

---

## 📦 Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (fast builds)
- Tailwind CSS
- pdf-lib (PDF manipulation)
- tesseract.js (OCR)
- JSZip (ZIP creation)

### Backend (Optional)
- Flask (Python)
- PyPDF2
- Pillow
- pytesseract

---

## 📁 Project Structure

```
├── src/
│   ├── App.tsx              # Main app with sidebar
│   ├── components/          # 10 feature modules
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
│   ├── services/            # Processing logic
│   │   ├── aiService.ts
│   │   ├── pdfService.ts
│   │   ├── imageService.ts
│   │   └── ocrService.ts
│   └── ui/                  # Reusable components
│       ├── Button.tsx
│       ├── Slider.tsx
│       ├── Dropzone.tsx
│       └── Toast.tsx
│
└── backend/                 # Optional Python backend
    ├── app.py
    ├── routes/
    ├── services/
    └── requirements.txt
```

---

## 📝 License

MIT License - Use freely in personal and commercial projects.
