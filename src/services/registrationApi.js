import { requestJson, uploadProfileImage } from '../utils/api';

export async function registerUser(payload) {
  return requestJson('/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function uploadRegistrationImage(file, token) {
  return uploadProfileImage(file, token);
}

export async function loginAfterRegistration(email, password) {
  return requestJson('/login', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
    }),
  });
}