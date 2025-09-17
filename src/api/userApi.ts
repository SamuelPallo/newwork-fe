export async function patchUser(userId: string, data: any, tokenOverride?: string | null) {
  const token = tokenOverride ?? tokenService.getToken();
  const res = await fetch(`${API_URL}/${userId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update user');
  return res.json();
}
export async function addUser(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roles: string[];
  jobTitle?: string;
  department?: string;
  hireDate?: string;
  phone?: string;
  address?: string;
  salary?: number;
  managerId?: string;
}) {
  const token = tokenService.getToken();
  // Prepare payload for backend
  const payload: any = {
    email: data.email,
    password: data.password,
    firstName: data.firstName,
    lastName: data.lastName,
    roles: data.roles,
    jobTitle: data.jobTitle,
    department: data.department,
    hireDate: data.hireDate,
    phone: data.phone ?? '',
    address: data.address ?? '',
    salary: data.salary ?? null,
    managerId: data.managerId ?? '',
  };
  const res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to add user');
  return res.json();
}
import { tokenService } from '../services/tokenService';

const API_URL = '/api/v1/users';

export async function getUsers(
  token: string | null,
  department?: string,
  managerId?: string,
  managerEmail?: string,
  role?: string
) {
  const params = new URLSearchParams();
  if (department) params.append('department', department);
  if (managerId) params.append('managerId', managerId);
  if (managerEmail) params.append('managerEmail', managerEmail);
  if (role) params.append('role', role);
  const url = params.toString() ? `${API_URL}?${params}` : API_URL;
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Failed to fetch users');
  const text = await res.text();
  if (!text) return [];
  try {
    return JSON.parse(text);
  } catch {
    return [];
  }
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
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}
