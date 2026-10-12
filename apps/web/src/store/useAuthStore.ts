import { create } from 'zustand';
import { apiUrl } from '../config/api';

export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  role: 'CUSTOMER' | 'ADMIN';
}

interface AuthStoreState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  setAuth: (token: string, user: AuthUser) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const TOKEN_KEY = 'beatstore_token_v1';
const USER_KEY = 'beatstore_user_v1';

export const useAuthStore = create<AuthStoreState>((set, get) => {
  const initialToken = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
  const initialUserRaw = typeof window !== 'undefined' ? localStorage.getItem(USER_KEY) : null;
  let initialUser: AuthUser | null = null;
  try {
    initialUser = initialUserRaw ? JSON.parse(initialUserRaw) : null;
  } catch {
    initialUser = null;
  }

  return {
    token: initialToken,
    user: initialUser,
    isAuthenticated: Boolean(initialToken),
    isAdmin: initialUser?.role === 'ADMIN',

    setAuth: (token: string, user: AuthUser) => {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      set({
        token,
        user,
        isAuthenticated: true,
        isAdmin: user.role === 'ADMIN',
      });
    },

    logout: () => {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        isAdmin: false,
      });
    },

    checkAuth: async () => {
      const token = get().token;
      if (!token) return;

      try {
        const res = await fetch(apiUrl('/api/auth/me'), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && data.data) {
          set({
            user: data.data,
            isAuthenticated: true,
            isAdmin: data.data.role === 'ADMIN',
          });
          localStorage.setItem(USER_KEY, JSON.stringify(data.data));
        } else {
          get().logout();
        }
      } catch {
        // Network error, keep stored state
      }
    },
  };
});
