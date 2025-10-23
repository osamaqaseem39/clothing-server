// Simple CORS test script
const https = require('https');

const options = {
  hostname: 'clothing-server-cyan.vercel.app',
  port: 443,
  path: '/api/products/published',
  method: 'GET',
  headers: {
    'Origin': 'https://clothing-website-lovat.vercel.app',
    'Access-Control-Request-Method': 'GET',
    'Access-Control-Request-Headers': 'Content-Type'
  }
};

console.log('Testing CORS configuration...');
console.log('Origin:', options.headers.Origin);
console.log('Endpoint:', options.path);

const req = https.request(options, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response received');
    if (res.headers['access-control-allow-origin']) {
      console.log('✅ CORS is configured correctly');
      console.log('Access-Control-Allow-Origin:', res.headers['access-control-allow-origin']);
    } else {
      console.log('❌ CORS headers missing');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
});

req.end();
