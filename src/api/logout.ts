import { tokenService } from '../services/tokenService';

export async function logout() {
  try {
    const token = tokenService.getToken();
    const res = await fetch('/api/v1/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    console.log('Logout API called, status:', res.status);
  } catch (err) {
    console.error('Logout API error:', err);
  }
}
