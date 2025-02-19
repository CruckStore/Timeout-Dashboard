export const loginAPI = async (username: string, password: string) => {
    const response = await fetch('http://82.153.202.154:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return response.json();
  };
  