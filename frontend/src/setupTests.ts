const localStorageMock: Storage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0,
};
global.localStorage = localStorageMock;

window.fetch = () => {
  return Promise.resolve(new Response(JSON.stringify({
    "authority": "https://localhost:7079",
    "client_id": "ScreenPlay",
    "redirect_uri": "https://localhost:7079/authentication/login-callback",
    "post_logout_redirect_uri": "https://localhost:7079/authentication/logout-callback",
    "response_type": "id_token token",
    "scope": "ScreenPlayAPI openid profile"
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  }));
};
