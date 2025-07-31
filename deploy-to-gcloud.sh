#!/bin/bash

# Google Cloud Run Deployment Script
# Requires gcloud CLI to be installed and authenticated

PROJECT_ID="your-project-id"  # Replace with your actual project ID
SERVICE_NAME="repdf-pdf-management-tool"
REGION="us-west1"

echo "🚀 Deploying RePDF to Google Cloud Run"
echo "======================================"

# Build production version
echo "📦 Building production version..."
npm run build:prod

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Build Docker image
echo "🐳 Building Docker image..."
docker build -t gcr.io/$PROJECT_ID/$SERVICE_NAME .

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed!"
    exit 1
fi

# Push to Google Container Registry
echo "📤 Pushing to Google Container Registry..."
docker push gcr.io/$PROJECT_ID/$SERVICE_NAME

if [ $? -ne 0 ]; then
    echo "❌ Docker push failed!"
    exit 1
fi

# Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
    --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --port 8080

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Your app is now live at:"
    gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)"
    echo ""
    echo "🧹 Users should clear browser cache and service workers to see changes"
else
    echo "❌ Deployment failed!"
    exit 1
fi