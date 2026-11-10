const SESSION_TOKEN_KEY = 'agridrone.session-token';

export const sessionStorage = {
  get: async () => {
    try {
      return globalThis.sessionStorage.getItem(SESSION_TOKEN_KEY);
    } catch {
      try {
        return globalThis.localStorage.getItem(SESSION_TOKEN_KEY);
      } catch {
        return null;
      }
    }
  },
  set: async (token: string) => {
    try {
      globalThis.sessionStorage.setItem(SESSION_TOKEN_KEY, token);
      return;
    } catch {
      try {
        globalThis.localStorage.setItem(SESSION_TOKEN_KEY, token);
      } catch {
        // Ignore storage failures in restricted browser contexts.
      }
    }
  },
  remove: async () => {
    try {
      globalThis.sessionStorage.removeItem(SESSION_TOKEN_KEY);
    } catch {
      try {
        globalThis.localStorage.removeItem(SESSION_TOKEN_KEY);
      } catch {
        // Ignore storage failures in restricted browser contexts.
      }
    }
  },
};