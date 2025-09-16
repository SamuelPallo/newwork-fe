import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { getUsers, deleteUser } from '../api/userApi';
import { Box, Table, Thead, Tbody, Tr, Th, Td, Button, Alert, AlertIcon } from '@chakra-ui/react';

export const UserManagement: React.FC = () => {
  const { user, isAdmin, isManager } = useAuth();
  const { data: users, isLoading, error, refetch } = useQuery({
    queryKey: ['users', isManager ? user?.sub : undefined],
    queryFn: () => {
      if (isManager && !isAdmin) {
        // Prefer UUID (sub) for managerId, fallback to email if not available
        // Only send managerId if it looks like a UUID
        if (user?.sub && /^[0-9a-fA-F-]{36}$/.test(user.sub)) {
          return getUsers(undefined, user.sub);
        } else if (user?.sub && user.sub.includes('@')) {
          return getUsers(undefined, undefined, user.sub);
        }
      }
      return getUsers();
    },
    enabled: isAdmin || isManager,
  });

  const handleDelete = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUser(userId);
      refetch();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete user');
    }
  };

  if (!isAdmin && !isManager) return <Alert status="error"><AlertIcon />Access denied.</Alert>;
  if (isLoading) return <Box>Loading users...</Box>;
  if (error) return <Alert status="error"><AlertIcon />Failed to load users.</Alert>;

  return (
    <Box className="w-full max-w-3xl mx-auto p-4">
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Email</Th>
            <Th>Role</Th>
            <Th>Department</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {users?.map((u: any) => (
            <Tr key={u.id}>
              <Td>{u.name}</Td>
              <Td>{u.email}</Td>
              <Td>{Array.isArray(u.roles) ? u.roles.join(', ') : u.roles}</Td>
              <Td>{u.department}</Td>
              <Td>
                <Button size="xs" colorScheme="blue" as="a" href={`/edit-user/${u.id}`}>Edit</Button>{' '}
                <Button size="xs" colorScheme="red" onClick={() => handleDelete(u.id)}>Delete</Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};
