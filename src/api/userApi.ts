export async function addUser(data: { name: string; email: string; department: string; roles: string; password: string }) {
  const token = tokenService.getToken();
  const res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to add user');
  return res.json();
}
import { tokenService } from '../services/tokenService';

const API_URL = '/api/v1/users';

export async function getUsers(department?: string, managerId?: string, managerEmail?: string) {
  const token = tokenService.getToken();
  const params = new URLSearchParams();
  if (department) params.append('department', department);
  if (managerId) params.append('managerId', managerId);
  if (managerEmail) params.append('managerEmail', managerEmail);
  const url = params.toString() ? `${API_URL}?${params}` : API_URL;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

export async function deleteUser(userId: string) {
  const token = tokenService.getToken();
  const res = await fetch(`${API_URL}/${userId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to delete user');
  return res.json();
}
