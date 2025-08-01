#!/bin/bash

# 🚀 RePDF Vercel Deployment Script
# Automated deployment to Vercel with proper configuration

echo "🚀 RePDF - Deploying to Vercel..."
echo "=====================================";

# Check if build is successful
echo "📦 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix errors before deploying."
    exit 1
fi

echo "✅ Build successful!"

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."

# Try to deploy using Vercel CLI if authenticated
if command -v vercel &> /dev/null && vercel whoami &> /dev/null; then
    echo "🔑 Using authenticated Vercel CLI..."
    vercel --prod --yes
else
    echo "🔗 Manual deployment required:"
    echo ""
    echo "1. Visit: https://vercel.com/new"
    echo "2. Import from Git: https://github.com/samuelvictorino/repdf"
    echo "3. Use these settings:"
    echo "   - Framework: Vite"
    echo "   - Build Command: npm run build"
    echo "   - Output Directory: dist"
    echo "   - Install Command: npm install"
    echo ""
    echo "4. Environment Variables (if needed):"
    echo "   - VITE_APP_TITLE=RePDF - Suíte Executiva PDF"
    echo ""
    echo "5. The vercel.json configuration will be automatically detected"
    echo ""
    echo "📋 Repository URL: https://github.com/samuelvictorino/repdf"
    echo "📄 Latest Commit: $(git log -1 --pretty=format:'%h - %s')"
fi

echo ""
echo "🎯 Deployment Features:"
echo "  ✅ Advanced PDF manipulation"
echo "  ✅ Dark theme by default"
echo "  ✅ Complete Portuguese translation"
echo "  ✅ AI-powered filename suggestions"
echo "  ✅ Intelligent delete confirmation"
echo "  ✅ Professional icon design"
echo "  ✅ Ollama integration ready"
echo ""
echo "📚 Architecture docs:"
echo "  📖 ADVANCED_AI_FEATURES.md"
echo "  📖 MCP_ARCHITECTURE.md"
echo "  📖 AI_AGENT_TOOL_ARCHITECTURE.md"
echo ""
echo "🌟 RePDF is ready for deployment!"