const AUTH_STORAGE_KEY = 'loggedUser';
const AUTH_EVENT_NAME = 'authChanged';

function parseJwtPayload(token) {
  if (!token || typeof token !== 'string') {
    return null;
  }

  const parts = token.split('.');
  if (parts.length < 2) {
    return null;
  }

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    return JSON.parse(atob(padded));
  } catch (error) {
    return null;
  }
}

export function getLoggedUser() {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function setLoggedUser(userData) {
  const tokenData = parseJwtPayload(userData?.token);
  const normalizedUser = {
    ...userData,
    id: userData?.id || tokenData?.id,
    email: userData?.email || tokenData?.email,
    admin: typeof userData?.admin === 'boolean' ? userData.admin : tokenData?.admin
  };

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(normalizedUser));
  window.dispatchEvent(new Event(AUTH_EVENT_NAME));
}

export function clearLoggedUser() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  window.dispatchEvent(new Event(AUTH_EVENT_NAME));
}

export const authChangedEvent = AUTH_EVENT_NAME;