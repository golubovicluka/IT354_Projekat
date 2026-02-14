const TOKEN_KEY = 'token';
const USER_KEY = 'user';

const isBrowser = () => typeof window !== 'undefined';

export const getStoredToken = () => {
  if (!isBrowser()) {
    return null;
  }

  const token = localStorage.getItem(TOKEN_KEY);
  return typeof token === 'string' && token.length > 0 ? token : null;
};

export const getStoredUser = () => {
  if (!isBrowser()) {
    return null;
  }

  const rawUser = localStorage.getItem(USER_KEY);
  if (!rawUser) {
    return null;
  }

  try {
    const parsedUser = JSON.parse(rawUser);
    return parsedUser && typeof parsedUser === 'object' ? parsedUser : null;
  } catch {
    return null;
  }
};

export const setStoredAuth = ({ token, user }) => {
  if (!isBrowser()) {
    return;
  }

  if (typeof token === 'string' && token.length > 0) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }

  if (user && typeof user === 'object') {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
};

export const clearStoredAuth = () => {
  if (!isBrowser()) {
    return;
  }

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};
