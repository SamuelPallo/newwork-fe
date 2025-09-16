
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
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [token, setToken] = useState<string | null>(null);
  const [activeRole, setActiveRoleState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Persist activeRole in localStorage
  const setActiveRole = (role: string | null) => {
    setActiveRoleState(role);
    if (role) {
      localStorage.setItem('activeRole', role);
    } else {
      localStorage.removeItem('activeRole');
    }
  };

  useEffect(() => {
    const updateAuth = () => {
      const t = tokenService.getToken();
      setToken(t);
      if (t) {
        const decoded = parseJwt(t);
        setUser(decoded);
        setUserId(decoded?.userId === null ? undefined : typeof decoded?.userId === 'string' ? decoded.userId : undefined);
        const storedRole = localStorage.getItem('activeRole');
        if (decoded?.roles) {
          if (storedRole && (Array.isArray(decoded.roles) ? decoded.roles.includes(storedRole) : decoded.roles === storedRole)) {
            setActiveRoleState(storedRole);
          } else if (Array.isArray(decoded.roles) && decoded.roles.length === 1) {
            setActiveRoleState(decoded.roles[0]);
            localStorage.setItem('activeRole', decoded.roles[0]);
          } else if (typeof decoded.roles === 'string') {
            setActiveRoleState(decoded.roles);
            localStorage.setItem('activeRole', decoded.roles);
          } else {
            setActiveRoleState(null);
            localStorage.removeItem('activeRole');
          }
        } else {
          setActiveRoleState(null);
          localStorage.removeItem('activeRole');
        }
      } else {
        setUser(null);
        setActiveRoleState(null);
        localStorage.removeItem('activeRole');
      }
      setLoading(false);
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
    userId,
    token,
    activeRole,
    setActiveRole,
    isManager,
    isAdmin,
    isEmployee,
    isOwner,
    loading,
  };
};
