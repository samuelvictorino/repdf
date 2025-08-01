#!/bin/bash

# 🚀 RePDF Deploy Script
# Automated deployment for RePDF Executive Suite

set -e  # Exit on any error

echo "🚀 RePDF Executive Suite - Deploy Script"
echo "======================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_status "Node.js version: $(node --version)"
print_status "npm version: $(npm --version)"

# Check for environment variables
if [ ! -f ".env" ]; then
    print_warning "No .env file found. Make sure to set GEMINI_API_KEY in your deployment platform."
    print_status "Creating .env from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_warning "Please edit .env file with your actual API keys before deploying."
    fi
fi

# Install dependencies
print_status "Installing dependencies..."
npm install

# Run build
print_status "Building for production..."
npm run build

if [ $? -eq 0 ]; then
    print_success "Build completed successfully!"
else
    print_error "Build failed!"
    exit 1
fi

# Check if dist directory was created
if [ ! -d "dist" ]; then
    print_error "Build output directory 'dist' not found!"
    exit 1
fi

print_success "Build output size:"
du -sh dist/*

echo ""
echo "🎉 Build completed successfully!"
echo ""
echo "Next steps:"
echo "1. 🔷 Vercel: Run 'vercel --prod' or push to GitHub"
echo "2. 🟢 Netlify: Drag 'dist' folder to netlify.com or run 'netlify deploy --prod --dir=dist'"
echo "3. 🟡 GitHub Pages: Run 'npm install gh-pages --save-dev' then 'npm run deploy:gh-pages'"
echo ""
echo "📝 Don't forget to set GEMINI_API_KEY environment variable in your deployment platform!"
echo ""

# Optional: Open dist directory
if command -v open &> /dev/null; then
    read -p "Open dist directory? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open dist
    fi
fi

print_success "Deploy preparation complete! 🚀"