# Vercel Deployment Guide for NestJS API

## Prerequisites
1. MongoDB Atlas account (for production database)
2. Vercel account
3. GitHub repository with your code

## Environment Variables Setup

### In Vercel Dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add the following variables:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-for-production
JWT_EXPIRES_IN=7d
SWAGGER_TITLE=E-commerce API
SWAGGER_DESCRIPTION=Clean e-commerce API built with NestJS and MongoDB
SWAGGER_VERSION=1.0
```

### MongoDB Atlas Setup:
1. Create a new cluster on MongoDB Atlas
2. Create a database user
3. Whitelist Vercel's IP ranges (or use 0.0.0.0/0 for all IPs)
4. Get your connection string and update MONGODB_URI

## Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Configure for Vercel deployment"
git push origin main
```

### 2. Deploy to Vercel
- Connect your GitHub repository to Vercel
- Vercel will automatically detect the configuration
- The build should complete successfully

### 3. Test Your API
After deployment, test these endpoints:
- `https://your-app.vercel.app/api/health`
- `https://your-app.vercel.app/api/products`
- `https://your-app.vercel.app/api/docs` (Swagger documentation)

## Troubleshooting

### Common Issues:

1. **Build Failures**
   - Check that all dependencies are in `package.json`
   - Ensure TypeScript compilation succeeds locally

2. **Database Connection Issues**
   - Verify MongoDB Atlas connection string
   - Check IP whitelist settings
   - Ensure database user has proper permissions

3. **Environment Variables**
   - Double-check all required variables are set in Vercel
   - Ensure no typos in variable names

4. **Function Timeout**
   - Increase timeout in `vercel.json` if needed
   - Optimize database queries

## File Structure
```
ecommerce-nest/
├── api/
│   └── index.js          # Vercel serverless function
├── src/
│   └── main.ts          # Updated for serverless
├── vercel.json          # Vercel configuration
├── package.json         # Dependencies and scripts
└── .vercelignore        # Files to exclude from deployment
```

## API Endpoints Available
- `/api/health` - Health check
- `/api/products` - Product management
- `/api/brands` - Brand management
- `/api/categories` - Category management
- `/api/customers` - Customer management
- `/api/orders` - Order management
- `/api/cart` - Shopping cart
- `/api/coupons` - Coupon management
- `/api/payments` - Payment processing
- `/api/shipping` - Shipping methods
- `/api/inventory` - Inventory management
- `/api/reviews` - Product reviews
- `/api/notifications` - Notifications
- `/api/auth` - Authentication
- `/api/admin` - Admin functions
- `/api/docs` - Swagger documentation
