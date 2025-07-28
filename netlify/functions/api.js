const { spawn } = require('child_process');

exports.handler = async (event, context) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Parse the request
    const { path, method, body, headers: requestHeaders } = event;
    
    // Route to appropriate handler
    switch (path) {
      case '/login':
        return handleLogin(body, headers);
      case '/register':
        return handleRegister(body, headers);
      case '/upload-calendar':
        return handleUploadCalendar(event, headers);
      default:
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Not found' })
        };
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

function handleLogin(body, headers) {
  // Implement login logic here
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ message: 'Login endpoint' })
  };
}

function handleRegister(body, headers) {
  // Implement registration logic here
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ message: 'Register endpoint' })
  };
}

function handleUploadCalendar(event, headers) {
  // Implement file upload logic here
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ message: 'Upload endpoint' })
  };
} 