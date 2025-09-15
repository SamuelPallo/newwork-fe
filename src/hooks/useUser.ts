
import { useQuery } from '@tanstack/react-query';
import { tokenService } from '../services/tokenService';

async function fetchProfile() {
  const token = tokenService.getToken();
  console.log('fetchProfile: token', token);
  const res = await fetch('/api/v1/users/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('fetchProfile: response', res);
  if (!res.ok) throw await res.json().catch(() => ({ message: 'Failed to fetch profile' }));
  return res.json();
}

export const useUser = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['me'],
    queryFn: fetchProfile,
    retry: false,
    enabled: !!tokenService.getToken(),
  });
  return {
    profile: data,
    loading: isLoading,
    error,
  };
};
