# Use Python 3.11 slim image
FROM python:3.11-slim

# Install system dependencies for OCR and PDF processing
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    libtesseract-dev \
    poppler-utils \
    libgl1 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend code
COPY . .

# Expose the port Flask will run on
EXPOSE 5000

# Start the application using Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app", "--timeout", "120"]
