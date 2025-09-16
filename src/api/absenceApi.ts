import { AbsenceFormValues } from '../components/AbsenceForm';
import { tokenService } from '../services/tokenService';

const API_URL = '/api/v1/absences';

export async function approveAbsenceRequest(id: string) {
  const token = tokenService.getToken();
  const res = await fetch(`${API_URL}/${id}/approve`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    let error;
    try {
      error = await res.json();
    } catch {
      error = { title: res.statusText };
    }
    throw new Error(error?.detail || error?.title || 'Failed to approve absence request');
  }
  return res.json();
}

export async function rejectAbsenceRequest(id: string) {
  const token = tokenService.getToken();
  const res = await fetch(`${API_URL}/${id}/reject`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    let error;
    try {
      error = await res.json();
    } catch {
      error = { title: res.statusText };
    }
    throw new Error(error?.detail || error?.title || 'Failed to reject absence request');
  }
  return res.json();
}

export async function createAbsenceRequest(data: AbsenceFormValues) {
  const token = tokenService.getToken();
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    let error;
    try {
      error = await res.json();
    } catch {
      error = { title: res.statusText };
    }
    throw new Error(error?.detail || error?.title || 'Failed to submit absence request');
  }
  return res.json();
}

export async function getAbsenceRequests() {
  const token = tokenService.getToken();
  const res = await fetch(API_URL, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    let error;
    try {
      error = await res.json();
    } catch {
      error = { title: res.statusText };
    }
    throw new Error(error?.detail || error?.title || 'Failed to fetch absence requests');
  }
  return res.json();
}

export async function getManagerPendingAbsences() {
  const token = tokenService.getToken();
  const res = await fetch(`${API_URL}/reports?status=PENDING`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    let error;
    try {
      error = await res.json();
    } catch {
      error = { title: res.statusText };
    }
    throw new Error(error?.detail || error?.title || 'Failed to fetch manager pending absences');
  }
  return res.json();
}

export async function getUserAbsenceRequests(userId: string) {
  const token = tokenService.getToken();
  const res = await fetch(`${API_URL}/${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    let error;
    try {
      error = await res.json();
    } catch {
      error = { title: res.statusText };
    }
    throw new Error(error?.detail || error?.title || 'Failed to fetch user absences');
  }
  return res.json();
}
