async function testUpdateEmployee() {
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

    // Update employee salary (let's update harshal dhotre with ID 14)
    const updateResponse = await fetch('http://localhost:5001/api/employees/14', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginData.token}`
      },
      body: JSON.stringify({
        salary: 60000
      })
    });

    const updateData = await updateResponse.json();
    console.log('Update response:', updateData);

    // Now get employees again to see if salary was updated
    const employeesResponse = await fetch('http://localhost:5001/api/employees', {
      headers: {
        'Authorization': `Bearer ${loginData.token}`
      }
    });

    const employeesData = await employeesResponse.json();
    console.log('Updated employees data:');
    employeesData.employees.forEach(emp => {
      if (emp.id === 14) {
        console.log('harshal dhotre salary:', emp.salary);
      }
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

testUpdateEmployee();