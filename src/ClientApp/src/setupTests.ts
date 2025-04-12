const localStorageMock: Storage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0,
};
global.localStorage = localStorageMock;

// Mock the request issued by the react app to get the client configuration parameters.
window.fetch = () => {
  return Promise.resolve(new Response(JSON.stringify({
    "authority": "https://localhost:7079",
    "client_id": "StreamSelect",
    "redirect_uri": "https://localhost:7079/authentication/login-callback",
    "post_logout_redirect_uri": "https://localhost:7079/authentication/logout-callback",
    "response_type": "id_token token",
    "scope": "StreamSelectAPI openid profile"
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  }));
};
