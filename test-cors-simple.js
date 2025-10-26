// Simple CORS test for dashboard origin
const https = require('https');

const testDashboardCors = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'clothing-server-cyan.vercel.app',
      port: 443,
      path: '/api/auth/me',
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://clothing-dashboard-seven.vercel.app',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type,Authorization'
      }
    };

    console.log('🧪 Testing CORS for dashboard -> API...');
    console.log('Origin:', options.headers.Origin);
    console.log('URL:', `https://${options.hostname}${options.path}`);

    const req = https.request(options, (res) => {
      console.log('\n📊 Response:');
      console.log('Status:', res.statusCode);
      console.log('Headers:');
      console.log('  Access-Control-Allow-Origin:', res.headers['access-control-allow-origin']);
      console.log('  Access-Control-Allow-Methods:', res.headers['access-control-allow-methods']);
      console.log('  Access-Control-Allow-Headers:', res.headers['access-control-allow-headers']);
      console.log('  Access-Control-Allow-Credentials:', res.headers['access-control-allow-credentials']);
      
      if (res.statusCode === 204 && res.headers['access-control-allow-origin']) {
        console.log('\n✅ CORS is working correctly!');
        resolve(true);
      } else {
        console.log('\n❌ CORS is not working properly');
        resolve(false);
      }
    });

    req.on('error', (err) => {
      console.log(`\n❌ Error testing CORS: ${err.message}`);
      reject(err);
    });

    req.end();
  });
};

testDashboardCors().catch(console.error);
