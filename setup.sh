#!/bin/bash

# DocuShrink AI - One-Line Setup Script
# =====================================

echo "🚀 Setting up DocuShrink AI..."

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Setup backend
echo "🐍 Setting up Python backend..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

# Activate and install dependencies
source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null
pip install -r requirements.txt --quiet

cd ..

echo "✅ Setup complete!"
echo ""
echo "To run the application:"
echo "  npm run start"
echo ""
echo "Or run separately:"
echo "  Frontend: npm run dev"
echo "  Backend:  cd backend && source venv/bin/activate && python app.py"
