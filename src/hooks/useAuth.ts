
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
  const [activeRole, setActiveRole] = useState<string | null>(null);

  useEffect(() => {
    const updateAuth = () => {
      const t = tokenService.getToken();
      setToken(t);
      if (t) {
        const decoded = parseJwt(t);
        setUser(decoded);
        // If only one role, set it as active automatically
        if (decoded?.roles) {
          if (Array.isArray(decoded.roles) && decoded.roles.length === 1) {
            setActiveRole(decoded.roles[0]);
          } else if (typeof decoded.roles === 'string') {
            setActiveRole(decoded.roles);
          }
        }
      } else {
        setUser(null);
        setActiveRole(null);
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

  // Role checks use only the selected activeRole
  const isAdmin = activeRole === 'ROLE_ADMIN';
  const isManager = activeRole === 'ROLE_MANAGER';
  const isEmployee = activeRole === 'ROLE_EMPLOYEE';
  const isOwner = (profileId?: string) => profileId && user?.sub === profileId;

  return {
    user,
    token,
    activeRole,
    setActiveRole,
    isManager,
    isAdmin,
    isEmployee,
    isOwner,
  };
};
