# Vercel Deployment Configuration

This project uses Vercel's built-in configuration through `package.json` instead of a custom `vercel.json` file.

## Configuration

The Vercel configuration is defined in `package.json`:

```json
{
  "vercel": {
    "buildCommand": "npm run vercel-build",
    "outputDirectory": "dist",
    "installCommand": "npm install",
    "framework": null,
    "functions": {
      "api/index.js": {
        "maxDuration": 30
      }
    }
  }
}
```

## Entry Point

- **Local Development**: Uses `src/main.ts` with `npm run start:dev`
- **Vercel Production**: Uses `api/index.js` as the serverless function entry point

## CORS Configuration

CORS is handled in both:
1. **Local Development**: `src/main.ts` with NestJS CORS middleware
2. **Vercel Production**: `api/index.js` with the same CORS configuration

## Deployment

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**:
   ```bash
   vercel --prod
   ```

3. **Test CORS**:
   ```bash
   node test-cors-fix.js
   ```

## Allowed Origins

- `https://clothing-website-lovat.vercel.app`
- `https://clothing-dashboard-seven.vercel.app`
- `http://localhost:3000`
- `http://localhost:3001`

## Benefits of This Approach

1. **Simpler Configuration**: No need for custom `vercel.json`
2. **Better Integration**: Uses Vercel's built-in detection
3. **Easier Maintenance**: Configuration is in `package.json`
4. **Consistent CORS**: Same CORS logic for both local and production
