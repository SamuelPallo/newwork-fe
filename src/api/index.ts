
export async function login({ email, password }: { email: string; password: string }) {
	try {
		const res = await fetch('/api/v1/auth/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email, password }),
		});
		if (!res.ok) {
			const error = await res.json().catch(() => ({}));
			throw error || { message: 'Login failed' };
		}
		return res.json(); // { accessToken, refreshToken, expiresIn }
	} catch (err: any) {
		// Detect network errors (e.g., backend is down)
		if (err instanceof TypeError || err?.code === 'ECONNREFUSED' || err?.message?.includes('Failed to fetch')) {
			throw { message: 'Service unavailable. Please try again later.' };
		}
		throw err;
	}
}
