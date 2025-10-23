// Test script to verify CORS configuration
const https = require('https');

const testCors = (url, origin) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: url.replace('https://', '').split('/')[0],
      port: 443,
      path: url.includes('https://') ? url.split('https://')[1].split('/').slice(1).join('/') : url,
      method: 'OPTIONS',
      headers: {
        'Origin': origin,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    };

    const req = https.request(options, (res) => {
      console.log(`\nTesting CORS for ${origin} -> ${url}`);
      console.log('Status:', res.statusCode);
      console.log('Headers:');
      console.log('  Access-Control-Allow-Origin:', res.headers['access-control-allow-origin']);
      console.log('  Access-Control-Allow-Methods:', res.headers['access-control-allow-methods']);
      console.log('  Access-Control-Allow-Headers:', res.headers['access-control-allow-headers']);
      console.log('  Access-Control-Allow-Credentials:', res.headers['access-control-allow-credentials']);
      
      if (res.statusCode === 204 && res.headers['access-control-allow-origin']) {
        console.log('✅ CORS is working correctly!');
        resolve(true);
      } else {
        console.log('❌ CORS is not working properly');
        resolve(false);
      }
    });

    req.on('error', (err) => {
      console.log(`❌ Error testing CORS: ${err.message}`);
      reject(err);
    });

    req.end();
  });
};

// Test the CORS configuration
async function runTests() {
  console.log('🧪 Testing CORS configuration...\n');
  
  const tests = [
    {
      url: 'https://clothing-server-cyan.vercel.app/api/products/published',
      origin: 'https://clothing-website-lovat.vercel.app'
    },
    {
      url: 'https://clothing-server-cyan.vercel.app/api/products/slug/elegant-evening-gown',
      origin: 'https://clothing-website-lovat.vercel.app'
    }
  ];

  for (const test of tests) {
    try {
      await testCors(test.url, test.origin);
    } catch (error) {
      console.log(`Failed to test ${test.url}: ${error.message}`);
    }
  }
}

runTests();
