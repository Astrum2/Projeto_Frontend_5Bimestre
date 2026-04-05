import { requestJson, uploadProfileImage } from '../utils/api';

export async function fetchUserProfile(userId, token) {
  return requestJson(`/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function updateUserProfile(userId, payload, token) {
  return requestJson(`/users/${userId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function uploadUserProfileImage(file, token) {
  return uploadProfileImage(file, token);
}