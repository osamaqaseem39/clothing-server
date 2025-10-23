#!/bin/bash

echo "🚀 Deploying CORS fixes to Vercel..."

# Build the project
echo "📦 Building the project..."
npm run build

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "🧪 Testing CORS configuration..."
node test-cors-fix.js

echo "📝 Next steps:"
echo "1. Wait a few minutes for the deployment to propagate"
echo "2. Test your frontend application"
echo "3. Check the browser console for any remaining CORS errors"
echo ""
echo "ℹ️  Note: Using package.json Vercel configuration instead of custom vercel.json"
