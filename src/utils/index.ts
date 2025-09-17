// Returns the most significant role from a roles array or string
export function getHighestRole(roles: any): string {
	if (Array.isArray(roles)) {
		if (roles.includes('ADMIN')) return 'Admin';
		if (roles.includes('MANAGER')) return 'Manager';
		if (roles.includes('EMPLOYEE')) return 'Employee';
	}
	if (typeof roles === 'string') {
		if (roles === 'ADMIN') return 'Admin';
		if (roles === 'MANAGER') return 'Manager';
		if (roles === 'EMPLOYEE') return 'Employee';
		return roles;
	}
	return '';
}
// Utility functions will be implemented here
