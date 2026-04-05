import { requestJson } from '../utils/api';

export async function loginWithEmailAndPassword(email, password) {
  return requestJson('/login', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
    }),
  });
}