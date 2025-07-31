#!/bin/bash

# RePDF Deployment Script
# This script deploys the production build to Google Cloud Run

echo "🚀 RePDF Deployment Script"
echo "=========================="

# Check if dist folder exists
if [ ! -d "dist" ]; then
    echo "❌ dist/ folder not found. Running build first..."
    npm run build:prod
fi

echo "📦 Build ready in dist/ folder"
echo "📂 Contents:"
ls -la dist/

echo ""
echo "🔧 Deployment Options:"
echo "1. Manual: Upload dist/ contents to Google Cloud Console"
echo "2. CLI: Use 'gcloud run deploy' (requires gcloud CLI setup)"
echo ""
echo "📋 Manual Deployment Steps:"
echo "1. Go to https://console.cloud.google.com"
echo "2. Navigate to Cloud Run > repdf-pdf-management-tool-839641309407"
echo "3. Click 'Edit & Deploy New Revision'"
echo "4. Upload all files from dist/ folder"
echo "5. Deploy"
echo ""
echo "🧹 After deployment, users should:"
echo "- Hard refresh (Ctrl+F5)"
echo "- Clear service worker in DevTools > Application > Service Workers"
echo "- Clear browser cache"
echo ""
echo "✅ dist/ folder is ready for deployment!"