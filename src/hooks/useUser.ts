
import { useQuery } from '@tanstack/react-query';
import { tokenService } from '../services/tokenService';

async function fetchProfile() {
  const token = tokenService.getToken();
  const res = await fetch('/api/v1/users/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw await res.json().catch(() => ({ message: 'Failed to fetch profile' }));
  return res.json();
}

export const useUser = () => {
  const { data, isLoading, error } = useQuery(['me'], fetchProfile, {
    retry: false,
    enabled: !!tokenService.getToken(),
  });
  return {
    profile: data,
    loading: isLoading,
    error,
  };
};
