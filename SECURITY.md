# Security Policy

## 🛡️ Our Commitment to Privacy

**DocuShrink AI** is built on a "Zero-Internet" and "Local-First" architecture. All processing is performed within your browser's environment using Web Workers. Data is never transmitted to any external server.

### 🧩 Local Processing Architecture

- **PDF Manipulation**: Handled locally via `pdf-lib`.
- **OCR Engine**: Handled locally via `tesseract.js` using bundled language trained data.
- **AI Text Processing**: Handled via client-side rule-based NLP.
- **Image Processing**: Handled locally via the Canvas API.

## 🤝 Reporting a Vulnerability

If you discover a security-related issue, please do not use the public GitHub issue tracker. Instead, please report it via the following channel:

- **Email**: [prsnlkalyan@gmail.com](mailto:prsnlkalyan@gmail.com)

We aim to acknowledge every report within 48 hours and provide a resolution or mitigation plan as quickly as possible.

### 🚫 Scope & Exclusion

DocuShrink AI is a client-side application hosted statically. The primary security scope includes:
- **Sanitization of Input Strings**: Ensuring that processed document metadata doesn't lead to XSS within the local UI.
- **Library Vulnerabilities**: Ensuring that all bundled dependencies (npm) are up-to-date and free from known exploits.

We do **not** have a centralized server or database. Any vulnerabilities found in the underlying hosting provider (e.g., Vercel, Netlify) should be reported directly to them.
