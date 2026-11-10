import * as SecureStore from 'expo-secure-store';

const SESSION_TOKEN_KEY = 'agridrone.session-token';
const isWeb = typeof window !== 'undefined';

export const sessionStorage = {
  get: async () => {
    if (isWeb) {
      try {
        return localStorage.getItem(SESSION_TOKEN_KEY);
      } catch {
        // Fall back to secure storage for browsers that restrict localStorage access.
      }
    }
    return SecureStore.getItemAsync(SESSION_TOKEN_KEY);
  },
  set: async (token: string) => {
    if (isWeb) {
      try {
        localStorage.setItem(SESSION_TOKEN_KEY, token);
        return;
      } catch {
        // Fall through to secure storage when browser storage is blocked.
      }
    }
    await SecureStore.setItemAsync(SESSION_TOKEN_KEY, token);
  },
  remove: async () => {
    if (isWeb) {
      try {
        localStorage.removeItem(SESSION_TOKEN_KEY);
        return;
      } catch {
        // Fall through to secure storage when browser storage is blocked.
      }
    }
    await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
  },
};