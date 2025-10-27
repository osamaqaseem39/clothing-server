// Test production server endpoints
const https = require('https');

const testProductionEndpoints = async () => {
  console.log('🔍 Testing Production Server Endpoints');
  console.log('=' .repeat(50));
  
  const baseUrl = 'clothing-server-cyan.vercel.app';
  const endpoints = [
    '/api/health',
    '/api/docs',
    '/api/products',
    '/api/categories',
    '/api/brands',
    '/api/auth/login'
  ];
  
  for (const endpoint of endpoints) {
    await new Promise((resolve) => {
      const options = {
        hostname: baseUrl,
        port: 443,
        path: endpoint,
        method: 'GET',
        headers: {
          'User-Agent': 'CORS-Test-Script'
        }
      };
      
      console.log(`\nTesting: https://${baseUrl}${endpoint}`);
      
      const req = https.request(options, (res) => {
        console.log(`  Status: ${res.statusCode}`);
        console.log(`  CORS Headers:`);
        console.log(`    Access-Control-Allow-Origin: ${res.headers['access-control-allow-origin'] || 'undefined'}`);
        console.log(`    Access-Control-Allow-Methods: ${res.headers['access-control-allow-methods'] || 'undefined'}`);
        console.log(`    Access-Control-Allow-Credentials: ${res.headers['access-control-allow-credentials'] || 'undefined'}`);
        
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            console.log(`  ✅ Endpoint working`);
          } else if (res.statusCode === 404) {
            console.log(`  ❌ Endpoint not found`);
          } else {
            console.log(`  ⚠️  Unexpected status: ${res.statusCode}`);
          }
          resolve();
        });
      });
      
      req.on('error', (err) => {
        console.log(`  ❌ Error: ${err.message}`);
        resolve();
      });
      
      req.setTimeout(10000, () => {
        console.log(`  ❌ Timeout`);
        req.destroy();
        resolve();
      });
      
      req.end();
    });
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📋 Production Server Analysis:');
  console.log('- If all endpoints return 404, the server is not properly deployed');
  console.log('- If endpoints work but no CORS headers, CORS is not configured');
  console.log('- If CORS headers are present, the configuration is working');
};

testProductionEndpoints().catch(console.error);

