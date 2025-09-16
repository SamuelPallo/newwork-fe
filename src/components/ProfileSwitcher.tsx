import * as React from 'react';

interface ProfileSwitcherProps {
    roles: string[];
    activeRole: string | null;
    setActiveRole: (role: string) => void;
}

export const ProfileSwitcher: React.FC<ProfileSwitcherProps> = ({ roles, activeRole, setActiveRole }) => {
    if (!roles || roles.length < 2) return null;
    return (
        <select
            className="ml-4 p-1 border rounded text-sm bg-white"
            value={activeRole || ''}
            onChange={e => {
                const val = e.target.value;
                setActiveRole(val.startsWith('ROLE_') ? val : `ROLE_${val}`);
            }}
            aria-label="Switch profile"
        >
            {roles.map((role: string) => {
                const value = role.startsWith('ROLE_') ? role : `ROLE_${role}`;
                return (
                    <option key={role} value={value}>
                        {role.replace('ROLE_', '')}
                    </option>
                );
            })}
        </select>
    );
};
