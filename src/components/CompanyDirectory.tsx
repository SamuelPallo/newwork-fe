import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUsers } from '../api/userApi';
import { getHighestRole } from '../utils';
import { useAuth } from '../hooks/useAuth';
import { Box, Table, Thead, Tbody, Tr, Th, Td, Button, Spinner, Alert, AlertIcon, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton } from '@chakra-ui/react';

export const CompanyDirectory: React.FC = () => {
  const [filter, setFilter] = React.useState<'all' | 'team'>('all');
  const { user, token } = useAuth();
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['company-users', filter, user?.sub],
    queryFn: async () => {
  // ...removed log containing token...
      if (filter === 'team' && user?.sub) {
        // Call /users/team/{email} with token from useAuth, using user.sub (email)
        const res = await fetch(`/api/v1/users/team/${user.sub}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error('Failed to fetch team');
        return res.json();
      }
      return getUsers(token);
    },
    enabled: !!user,
  });
  const [selectedUser, setSelectedUser] = React.useState<any>(null);
  const [isOpen, setIsOpen] = React.useState(false);

  const handleView = (user: any) => {
    setSelectedUser(user);
    setIsOpen(true);
  };
  const handleClose = () => {
    setIsOpen(false);
    setSelectedUser(null);
  };

  if (isLoading) return <Box p={8} textAlign="center"><Spinner size="lg" />Loading users...</Box>;
  if (error) return <Alert status="error"><AlertIcon />Failed to load users.</Alert>;

  return (
    <Box className="w-full max-w-3xl mx-auto p-4">
      <Box mb={4}>
        <label htmlFor="filter" style={{ marginRight: 8 }}>Show:</label>
        <select id="filter" value={filter} onChange={e => setFilter(e.target.value as 'all' | 'team')}>
          <option value="all">All</option>
          <option value="team">Team</option>
        </select>
      </Box>
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Email</Th>
            <Th>Department</Th>
            <Th>Role</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {users?.map((u: any) => (
            <Tr key={u.id}>
              <Td>{`${u.firstName || ''} ${u.lastName || ''}`.trim()}</Td>
              <Td>{u.email}</Td>
              <Td>{u.department}</Td>
              <Td>{getHighestRole(u.roles)}</Td>
              <Td>
                <Button size="xs" colorScheme="blue" onClick={() => handleView(u)}>View</Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <Modal isOpen={isOpen} onClose={handleClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Employee Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedUser && (
              <Box>
                <div><b>Name:</b> {`${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`.trim()}</div>
                <div><b>Email:</b> {selectedUser.email}</div>
                <div><b>Department:</b> {selectedUser.department}</div>
                <div><b>Manager:</b> {selectedUser.managerName ?? 'None'}</div>
                <div><b>Job Title:</b> {selectedUser.jobTitle || selectedUser.job_title || ''}</div>
                <div><b>Hire Date:</b> {selectedUser.hireDate || selectedUser.hire_date || ''}</div>
                <div><b>Role:</b> {getHighestRole(selectedUser.roles)}</div>
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};
