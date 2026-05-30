# 📄 DocuShrink AI — Serverless Offline Document Suite

[![Local OCR](https://img.shields.io/badge/OCR-100%25%20Offline%20%7C%2013%20Languages-0ea5e9?style=for-the-badge&logo=googlechrome)]()
[![Type: PWA](https://img.shields.io/badge/Type-Progressive%20Web%20App-009688?style=for-the-badge&logo=pwa)]()
[![Frontend: React & TS](https://img.shields.io/badge/Frontend-React%20%7C%20TypeScript%20%7C%20TailwindCSS-61dafb?style=for-the-badge&logo=react)]()

> **"DocuShrink AI is a client-side document processing workspace built with React 19 and TypeScript. By executing WebAssembly-compiled libraries (Tesseract.js for OCR) directly inside the browser sandbox, it processes files 100% locally with $0 server hosting cost."**

---

## ⚡ The Recruiter Takeaway (Why This Matters)
1. **Serverless & Local-First**: Zero server uploads. Heavy operations run in browser RAM—ensuring complete client-side data privacy.
2. **Offline Progressive Web App (PWA)**: Implements Service Workers to cache resources, allowing full functionality when completely disconnected.
3. **Optimized Client Engines**: Houses 10 custom tools, including an offline multithreaded PDF compiler, EXIF metadata stripper, and secure lock tools.

---

## 🏗️ Serverless Sandbox Pipeline

```mermaid
graph LR
    File[Upload File/Image] --> Sandbox[Browser Client Sandbox]
    Sandbox --> SW[PWA Service Worker Cache]
    Sandbox --> Tesseract[Tesseract.js WASM OCR Engine]
    Sandbox --> Compress[Client PDF Compression Engine]
    Tesseract --> Output[Structured Text & Metadata]
    Compress --> Output
```

---

## 🛠️ Quick Launch

### 1. Requirements
* Install [Node.js](https://nodejs.org/) (v18.0+).

### 2. Startup Command
```bash
git clone https://github.com/kalyan-1845/Data-Processing-System.git
cd Data-Processing-System
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.