export async function logout() {
  try {
    const res = await fetch('/api/v1/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    console.log('Logout API called, status:', res.status);
  } catch (err) {
    console.error('Logout API error:', err);
  }
}
