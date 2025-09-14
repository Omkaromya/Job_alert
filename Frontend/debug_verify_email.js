// Test script to debug verify-email endpoint
// Run this in browser console to test different payload formats

async function testVerifyEmail() {
  const baseUrl = 'http://127.0.0.1:8000/api/v1/auth/verify-email';
  
  // Test different payload formats
  const testPayloads = [
    // Format 1: Current frontend format
    { email: 'test@example.com', otp: '123456' },
    
    // Format 2: Alternative field names
    { email: 'test@example.com', verification_code: '123456' },
    { email: 'test@example.com', code: '123456' },
    { email: 'test@example.com', token: '123456' },
    
    // Format 3: Different structure
    { user_email: 'test@example.com', otp_code: '123456' },
    { email_address: 'test@example.com', otp: '123456' },
    
    // Format 4: With additional fields
    { email: 'test@example.com', otp: '123456', user_id: 1 },
  ];
  
  console.log('Testing verify-email endpoint with different payload formats...');
  
  for (let i = 0; i < testPayloads.length; i++) {
    const payload = testPayloads[i];
    console.log(`\n--- Test ${i + 1}: ${JSON.stringify(payload)} ---`);
    
    try {
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      const responseText = await response.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        responseData = responseText;
      }
      
      console.log(`Status: ${response.status}`);
      console.log(`Response:`, responseData);
      
      if (response.status === 200) {
        console.log('✅ SUCCESS! This format works!');
        break;
      } else if (response.status === 400) {
        console.log('❌ 400 Bad Request - Wrong format');
      } else if (response.status === 404) {
        console.log('❌ 404 Not Found - Endpoint not found');
        break;
      }
      
    } catch (error) {
      console.log(`❌ Error:`, error.message);
    }
  }
}

// Also test if the endpoint exists
async function testEndpointExists() {
  console.log('\n--- Testing if endpoint exists ---');
  
  try {
    // Test with OPTIONS request
    const response = await fetch('http://127.0.0.1:8000/api/v1/auth/verify-email', {
      method: 'OPTIONS'
    });
    
    console.log(`OPTIONS Status: ${response.status}`);
    console.log('Headers:', [...response.headers.entries()]);
    
  } catch (error) {
    console.log('OPTIONS Error:', error.message);
  }
  
  try {
    // Test with GET request
    const response = await fetch('http://127.0.0.1:8000/api/v1/auth/verify-email', {
      method: 'GET'
    });
    
    console.log(`GET Status: ${response.status}`);
    const text = await response.text();
    console.log('GET Response:', text);
    
  } catch (error) {
    console.log('GET Error:', error.message);
  }
}

// Run the tests
console.log('🔍 Starting verify-email endpoint debugging...');
testEndpointExists().then(() => {
  testVerifyEmail();
});

