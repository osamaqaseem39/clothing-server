@echo off
echo 🚀 Deploying CORS fixes to Vercel...

REM Build the project
echo 📦 Building the project...
npm run build

REM Deploy to Vercel
echo 🌐 Deploying to Vercel...
vercel --prod

echo ✅ Deployment complete!
echo 🧪 Testing CORS configuration...
node test-cors-fix.js

echo 📝 Next steps:
echo 1. Wait a few minutes for the deployment to propagate
echo 2. Test your frontend application
echo 3. Check the browser console for any remaining CORS errors

pause
