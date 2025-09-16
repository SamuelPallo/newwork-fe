export async function addUser(data: {
  name: string;
  email: string;
  department: string;
  roles: string;
  password: string;
  phone?: string;
  address?: string;
  jobTitle?: string;
  hireDate?: string;
  salary?: string | number;
}) {
  const token = tokenService.getToken();
  // Prepare payload for backend
  const payload: any = {
    name: data.name,
    email: data.email,
    department: data.department,
    roles: data.roles,
    password: data.password,
    jobTitle: data.jobTitle,
    hireDate: data.hireDate,
  };
  // Add sensitiveData if present
  if (data.phone || data.address || data.salary) {
    payload.sensitiveData = {
      phone: data.phone || '',
      address: data.address || '',
      salary: data.salary || '',
    };
  }
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
