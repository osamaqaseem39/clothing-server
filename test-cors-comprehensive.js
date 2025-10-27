// Comprehensive CORS test script
const https = require('https');
const http = require('http');

// Test configuration
const config = {
  production: {
    hostname: 'clothing-server-cyan.vercel.app',
    port: 443,
    protocol: 'https'
  },
  local: {
    hostname: 'localhost',
    port: 3001,
    protocol: 'http'
  }
};

const allowedOrigins = [
  'https://clothing-website-lovat.vercel.app',
  'https://clothing-dashboard-seven.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001'
];

const testEndpoints = [
  '/api/products/published',
  '/api/auth/me',
  '/api/categories',
  '/api/brands'
];

// Test function for both HTTP and HTTPS
const testCors = (server, endpoint, origin, method = 'OPTIONS') => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: server.hostname,
      port: server.port,
      path: endpoint,
      method: method,
      headers: {
        'Origin': origin,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type,Authorization'
      }
    };

    const client = server.protocol === 'https' ? https : http;
    
    console.log(`\n🧪 Testing ${method} ${server.protocol}://${server.hostname}:${server.port}${endpoint}`);
    console.log(`   Origin: ${origin}`);

    const req = client.request(options, (res) => {
      console.log(`   Status: ${res.statusCode}`);
      console.log(`   Headers:`);
      console.log(`     Access-Control-Allow-Origin: ${res.headers['access-control-allow-origin'] || 'undefined'}`);
      console.log(`     Access-Control-Allow-Methods: ${res.headers['access-control-allow-methods'] || 'undefined'}`);
      console.log(`     Access-Control-Allow-Headers: ${res.headers['access-control-allow-headers'] || 'undefined'}`);
      console.log(`     Access-Control-Allow-Credentials: ${res.headers['access-control-allow-credentials'] || 'undefined'}`);
      console.log(`     Access-Control-Max-Age: ${res.headers['access-control-max-age'] || 'undefined'}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const isSuccess = res.headers['access-control-allow-origin'] === origin;
        console.log(`   Result: ${isSuccess ? '✅ CORS working' : '❌ CORS failed'}`);
        resolve({
          success: isSuccess,
          status: res.statusCode,
          headers: res.headers,
          origin: origin,
          endpoint: endpoint,
          method: method
        });
      });
    });

    req.on('error', (err) => {
      console.log(`   ❌ Error: ${err.message}`);
      resolve({
        success: false,
        error: err.message,
        origin: origin,
        endpoint: endpoint,
        method: method
      });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      console.log(`   ❌ Timeout`);
      resolve({
        success: false,
        error: 'Timeout',
        origin: origin,
        endpoint: endpoint,
        method: method
      });
    });

    req.end();
  });
};

// Test unauthorized origin
const testUnauthorizedOrigin = (server, endpoint) => {
  return testCors(server, endpoint, 'https://malicious-site.com');
};

// Run comprehensive tests
async function runComprehensiveTests() {
  console.log('🚀 Starting Comprehensive CORS Tests\n');
  console.log('=' .repeat(60));
  
  const results = {
    production: { success: 0, total: 0, details: [] },
    local: { success: 0, total: 0, details: [] }
  };

  // Test production server
  console.log('\n📡 Testing Production Server (clothing-server-cyan.vercel.app)');
  console.log('-'.repeat(50));
  
  for (const endpoint of testEndpoints) {
    for (const origin of allowedOrigins) {
      const result = await testCors(config.production, endpoint, origin);
      results.production.total++;
      if (result.success) results.production.success++;
      results.production.details.push(result);
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Test unauthorized origin
    const unauthorizedResult = await testUnauthorizedOrigin(config.production, endpoint);
    results.production.total++;
    if (!unauthorizedResult.success) results.production.success++; // Should fail
    results.production.details.push(unauthorizedResult);
  }

  // Test local server
  console.log('\n🏠 Testing Local Server (localhost:3000)');
  console.log('-'.repeat(50));
  
  for (const endpoint of testEndpoints.slice(0, 2)) { // Test fewer endpoints for local
    for (const origin of allowedOrigins.slice(2, 4)) { // Test localhost origins
      const result = await testCors(config.local, endpoint, origin);
      results.local.total++;
      if (result.success) results.local.success++;
      results.local.details.push(result);
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // Summary
  console.log('\n📊 Test Summary');
  console.log('=' .repeat(60));
  console.log(`Production Server: ${results.production.success}/${results.production.total} tests passed`);
  console.log(`Local Server: ${results.local.success}/${results.local.total} tests passed`);
  
  // Detailed analysis
  console.log('\n🔍 Detailed Analysis');
  console.log('-'.repeat(30));
  
  const productionSuccess = results.production.details.filter(r => r.success).length;
  const productionTotal = results.production.details.length;
  const localSuccess = results.local.details.filter(r => r.success).length;
  const localTotal = results.local.details.length;
  
  console.log(`Production Success Rate: ${((productionSuccess / productionTotal) * 100).toFixed(1)}%`);
  console.log(`Local Success Rate: ${((localSuccess / localTotal) * 100).toFixed(1)}%`);
  
  // Recommendations
  console.log('\n💡 Recommendations');
  console.log('-'.repeat(20));
  
  if (productionSuccess < productionTotal * 0.8) {
    console.log('❌ Production CORS needs attention - check server configuration');
  } else {
    console.log('✅ Production CORS is working well');
  }
  
  if (localSuccess < localTotal * 0.8) {
    console.log('❌ Local CORS needs attention - ensure server is running');
  } else {
    console.log('✅ Local CORS is working well');
  }
  
  console.log('\n🏁 Test completed!');
}

// Run the tests
runComprehensiveTests().catch(console.error);
