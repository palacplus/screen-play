import { User } from '@/types/user';
import { AuthEndpoints } from '@/types/endpoints';


export async function registerWithToken(authToken: string) {
    const response = await fetch(AuthEndpoints.TOKEN_REGISTER, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            token: authToken
        }),
    });
    if (!response.ok) {
        throw new Error(response.statusText);
    }
    const newUser = await response.json();
    createUser(newUser.email, newUser.token);
    return [200, { authToken, user: testUser }] as const;
}

export async function login() {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const authToken = generateAuthToken();

  return [200, { authToken, user: testUser }] as const;
}

function generateAuthToken() {
  return Math.random().toString(36).substring(2);
}

function createUser(email: string, accessToken: string) {
    const newUser : User = {
        email: email,
        token: accessToken,
        createdAt: new Date(),
    }
  return newUser;
}