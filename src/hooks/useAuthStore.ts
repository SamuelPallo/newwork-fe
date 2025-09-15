import { create } from 'zustand';
import { tokenService } from '../services/tokenService';

function parseJwt(token: string) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

interface AuthState {
  token: string | null;
  user: any;
  setToken: (token: string | null) => void;
  clearToken: () => void;
  refreshAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: tokenService.getToken(),
  user: parseJwt(tokenService.getToken() || ''),
  setToken: (token) => {
    tokenService.setToken(token || '', '');
    set({ token, user: parseJwt(token || '') });
  },
  clearToken: () => {
    tokenService.clearToken();
    set({ token: null, user: null });
  },
  refreshAuth: () => {
    const t = tokenService.getToken();
    set({ token: t, user: parseJwt(t || '') });
  },
}));
