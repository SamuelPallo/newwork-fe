
import { useEffect, useState } from 'react';
import { tokenService } from '../services/tokenService';

function parseJwt(token: string) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const updateAuth = () => {
      const t = tokenService.getToken();
      setToken(t);
      if (t) {
        const decoded = parseJwt(t);
        setUser(decoded);
      } else {
        setUser(null);
      }
    };
    updateAuth();
    window.addEventListener('storage', updateAuth);
    window.addEventListener('authChanged', updateAuth);
    return () => {
      window.removeEventListener('storage', updateAuth);
      window.removeEventListener('authChanged', updateAuth);
    };
  }, []);

  // Example: roles in JWT: { role: 'manager' | 'user' | 'admin', sub: userId }
  const isManager = user?.role === 'manager' || user?.role === 'admin';
  const isOwner = (profileId?: string) => profileId && user?.sub === profileId;

  return {
    user,
    token,
    isManager,
    isOwner,
  };
};
