import React from 'react';
import { Box, Button } from '@chakra-ui/react';

export type RoleInputProps = {
  roles: string[];
  activeRole: string;
  onAdd: (role: string) => void;
  onRemove: (role: string) => void;
};

const allRoles = [
  { value: 'ROLE_EMPLOYEE', label: 'Employee' },
  { value: 'ROLE_MANAGER', label: 'Manager' },
  { value: 'ROLE_ADMIN', label: 'Admin' },
];

export const RoleInput: React.FC<RoleInputProps> = ({ roles, activeRole, onAdd, onRemove }) => {
  return (
    <>
      <Box mb={2} display="flex" gap={2} flexWrap="wrap">
        {roles.map((role: string) => {
          const label = allRoles.find(r => r.value === role)?.label || role;
          // Employee card always present, cannot be removed
          const showX = role !== 'ROLE_EMPLOYEE' && (
            (activeRole === 'ROLE_MANAGER' && role === 'ROLE_MANAGER') ||
            (activeRole === 'ROLE_ADMIN' && (role === 'ROLE_MANAGER' || role === 'ROLE_ADMIN'))
          );
          return (
            <Box key={role} px={3} py={1} bg="gray.200" borderRadius="md" display="flex" alignItems="center" gap={1}>
              <span>{label}</span>
              {showX && (
                <Button size="xs" ml={1} onClick={() => onRemove(role)} aria-label={`Remove ${label}`}>x</Button>
              )}
            </Box>
          );
        })}
      </Box>
      <Box mb={2} display="flex" gap={2}>
        {(() => {
          // Manager: can add Manager if not present
          if (activeRole === 'ROLE_MANAGER') {
            if (!roles.includes('ROLE_MANAGER')) {
              return <Button key="ROLE_MANAGER" size="xs" onClick={() => onAdd('ROLE_MANAGER')}>Manager</Button>;
            }
            return null;
          }
          // Admin: can add Manager/Admin if not present
          if (activeRole === 'ROLE_ADMIN') {
            return allRoles.filter(r => r.value !== 'ROLE_EMPLOYEE' && !roles.includes(r.value)).map(r => (
              <Button key={r.value} size="xs" onClick={() => onAdd(r.value)}>{r.label}</Button>
            ));
          }
          // Employee: no add buttons
          return null;
        })()}
      </Box>
    </>
  );
};
