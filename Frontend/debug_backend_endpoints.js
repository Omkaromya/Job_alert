// Debug script to test backend endpoints
// Run this in browser console after logging in

async function debugBackendEndpoints() {
  const token = localStorage.getItem('token');
  if (!token) {
    console.log('❌ No token found. Please login first.');
    return;
  }

  console.log('🔍 Testing backend endpoints...');
  
  const endpoints = [
    { name: 'Profile', url: 'http://127.0.0.1:8000/api/v1/users/profile/' },
    { name: 'Me', url: 'http://127.0.0.1:8000/api/v1/auth/me' },
    { name: 'My Role', url: 'http://127.0.0.1:8000/api/v1/auth/my-role' }
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\n--- Testing ${endpoint.name} ---`);
      const response = await fetch(endpoint.url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      console.log(`Status: ${response.status}`);
      console.log('Response:', data);
      
      if (data.role) {
        console.log(`✅ Found role: ${data.role}`);
      } else if (data.user_role) {
        console.log(`✅ Found user_role: ${data.user_role}`);
      } else if (data.user?.role) {
        console.log(`✅ Found user.role: ${data.user.role}`);
      } else {
        console.log('❌ No role field found');
        console.log('Available fields:', Object.keys(data));
      }
      
    } catch (error) {
      console.log(`❌ Error testing ${endpoint.name}:`, error.message);
    }
  }
}

// Run the debug
debugBackendEndpoints();
