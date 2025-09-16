
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { getUsers, deleteUser } from '../api/userApi';
import { Box, Table, Thead, Tbody, Tr, Th, Td, Button, Alert, AlertIcon, Spinner } from '@chakra-ui/react';
import {
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter
} from '@chakra-ui/react';


export const UserManagement: React.FC = () => {
  const { user, activeRole, loading } = useAuth();
  const isManagerProfile = activeRole === 'ROLE_MANAGER';
  const isAdminProfile = activeRole === 'ROLE_ADMIN';
  // Only enable query if all required state is present
  const queryEnabled = !!user && !!activeRole && !!user.sub && (isAdminProfile || isManagerProfile);
  const { data: users, isLoading, error, refetch } = useQuery({
    queryKey: ['users', activeRole, isManagerProfile ? user?.sub : undefined],
    queryFn: () => {
      if (isManagerProfile && !isAdminProfile) {
        // Prefer UUID (sub) for managerId, fallback to email if not available
        if (user?.sub && /^[0-9a-fA-F-]{36}$/.test(user.sub)) {
          return getUsers(undefined, user.sub);
        } else if (user?.sub && user.sub.includes('@')) {
          return getUsers(undefined, undefined, user.sub);
        }
      }
      return getUsers();
    },
    enabled: queryEnabled,
  });

  // Refetch users when activeRole changes
  React.useEffect(() => {
    if (queryEnabled) {
      refetch();
    }
  }, [activeRole, queryEnabled, refetch]);

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<any>(null);
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  const openDeleteDialog = (user: any) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedUser(null);
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      await deleteUser(selectedUser.id);
      refetch();
      closeDeleteDialog();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete user');
    }
  };

  // UI rendering logic only, hooks above
  if (loading || !activeRole || !user || !user.sub) {
    return (
      <Box p={8} textAlign="center">
        <Spinner size="lg" />
        <div>Loading user management...</div>
      </Box>
    );
  }
  if (!isAdminProfile && !isManagerProfile) {
    return <Alert status="error"><AlertIcon />Access denied.</Alert>;
  }
  if (isLoading) {
    return (
      <Box p={8} textAlign="center">
        <Spinner size="lg" />
        <div>Loading users...</div>
      </Box>
    );
  }
  if (error) {
    return <Alert status="error"><AlertIcon />Failed to load users.</Alert>;
  }

  return (
    <>
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
                <Td>{`${u.firstName || ''} ${u.lastName || ''}`.trim()}</Td>
                <Td>{u.email}</Td>
                <Td>{Array.isArray(u.roles) ? u.roles.join(', ') : u.roles}</Td>
                <Td>{u.department}</Td>
                <Td>
                  <Button size="xs" colorScheme="blue" as="a" href={`/edit-user/${u.id}`}>Edit</Button>{' '}
                  <Button size="xs" colorScheme="red" onClick={() => openDeleteDialog(u)}>Delete</Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
      {/* Delete confirmation dialog */}
      <AlertDialog
        isOpen={deleteDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={closeDeleteDialog}
      >
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Delete Employee
          </AlertDialogHeader>
          <AlertDialogBody>
            {`Do you want to delete employee ${selectedUser ? `${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`.trim() : ''}?`}
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={closeDeleteDialog}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleDelete} ml={3}>
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
