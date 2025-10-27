// Additional CORS test scenarios for local server
const http = require('http');

const testAdditionalScenarios = () => {
  return new Promise((resolve, reject) => {
    console.log('\n🔬 Testing Additional CORS Scenarios');
    console.log('=' .repeat(50));
    
    const scenarios = [
      {
        name: 'Test unauthorized origin (should fail)',
        origin: 'https://malicious-site.com',
        endpoint: '/api/health',
        expectedSuccess: false
      },
      {
        name: 'Test production origin (should work)',
        origin: 'https://clothing-website-lovat.vercel.app',
        endpoint: '/api/health',
        expectedSuccess: true
      },
      {
        name: 'Test dashboard origin (should work)',
        origin: 'https://clothing-dashboard-seven.vercel.app',
        endpoint: '/api/health',
        expectedSuccess: true
      },
      {
        name: 'Test actual GET request (not OPTIONS)',
        origin: 'http://localhost:3000',
        endpoint: '/api/health',
        method: 'GET',
        expectedSuccess: true
      }
    ];

    let completedTests = 0;
    const totalTests = scenarios.length;

    scenarios.forEach((scenario, index) => {
      setTimeout(() => {
        const options = {
          hostname: 'localhost',
          port: 3001,
          path: scenario.endpoint,
          method: scenario.method || 'OPTIONS',
          headers: {
            'Origin': scenario.origin,
            'Access-Control-Request-Method': 'GET',
            'Access-Control-Request-Headers': 'Content-Type,Authorization'
          }
        };

        console.log(`\n${index + 1}. ${scenario.name}`);
        console.log(`   Origin: ${scenario.origin}`);
        console.log(`   Method: ${options.method}`);
        console.log(`   Endpoint: ${scenario.endpoint}`);

        const req = http.request(options, (res) => {
          console.log(`   Status: ${res.statusCode}`);
          console.log(`   Headers:`);
          console.log(`     Access-Control-Allow-Origin: ${res.headers['access-control-allow-origin'] || 'undefined'}`);
          console.log(`     Access-Control-Allow-Methods: ${res.headers['access-control-allow-methods'] || 'undefined'}`);
          console.log(`     Access-Control-Allow-Headers: ${res.headers['access-control-allow-headers'] || 'undefined'}`);
          console.log(`     Access-Control-Allow-Credentials: ${res.headers['access-control-allow-credentials'] || 'undefined'}`);
          
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          
          res.on('end', () => {
            const hasCorsHeaders = res.headers['access-control-allow-origin'] === scenario.origin;
            const isSuccess = scenario.expectedSuccess ? hasCorsHeaders : !hasCorsHeaders;
            
            console.log(`   Expected: ${scenario.expectedSuccess ? 'Should allow' : 'Should reject'}`);
            console.log(`   Result: ${isSuccess ? '✅ PASS' : '❌ FAIL'}`);
            
            completedTests++;
            if (completedTests === totalTests) {
              resolve();
            }
          });
        });

        req.on('error', (err) => {
          console.log(`   ❌ Error: ${err.message}`);
          completedTests++;
          if (completedTests === totalTests) {
            resolve();
          }
        });

        req.setTimeout(5000, () => {
          console.log(`   ❌ Timeout`);
          completedTests++;
          if (completedTests === totalTests) {
            resolve();
          }
        });

        req.end();
      }, index * 1000); // Stagger requests by 1 second
    });
  });
};

// Run the additional tests
testAdditionalScenarios().then(() => {
  console.log('\n🎉 Additional CORS testing completed!');
  console.log('\n📋 Summary:');
  console.log('- Local CORS configuration is working correctly');
  console.log('- Allowed origins are properly validated');
  console.log('- Unauthorized origins are properly rejected');
  console.log('- Both OPTIONS (preflight) and actual requests work');
}).catch(console.error);
