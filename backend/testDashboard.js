async function testDashboard() {
  const fetch = (await import('node-fetch')).default;

  try {
    // First login to get token
    const loginResponse = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@company.com',
        password: 'admin123'
      })
    });

    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);

    if (!loginData.token) {
      console.error('No token received');
      return;
    }

    // Now get dashboard stats
    const statsResponse = await fetch('http://localhost:5001/api/dashboard/stats', {
      headers: {
        'Authorization': `Bearer ${loginData.token}`
      }
    });

    const statsData = await statsResponse.json();
    console.log('Dashboard stats:', JSON.stringify(statsData, null, 2));

  } catch (error) {
    console.error('Error:', error);
  }
}

testDashboard();