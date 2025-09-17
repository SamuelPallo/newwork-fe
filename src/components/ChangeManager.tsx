import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getUsers, patchUser } from '../api/userApi';
import { Box, Input, Button, FormLabel, Select, Spinner, Alert, AlertIcon } from '@chakra-ui/react';

export const ChangeManager: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [managerId, setManagerId] = React.useState('');

  // Fetch user data
  const { data: user, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ['user', id],
    queryFn: () => getUsers(token, undefined, undefined, undefined).then(users => users.find((u: any) => u.id === id)),
    enabled: !!id && !!token
  });

  // Fetch managers
  const { data: managers, isLoading: mgrLoading } = useQuery({
    queryKey: ['managers', token],
    queryFn: () => getUsers(token, undefined, undefined, undefined, 'MANAGER'),
    enabled: !!token
  });

  React.useEffect(() => {
    if (user && user.managerId) setManagerId(user.managerId);
  }, [user]);

  const mutation = useMutation({
    mutationFn: (newManagerId: string) => patchUser(id!, { managerId: newManagerId }, token),
    onSuccess: () => navigate('/user-management'),
  });

  if (userLoading || mgrLoading) return <Box p={8} textAlign="center"><Spinner size="lg" /><div>Loading...</div></Box>;
  if (userError) return <Alert status="error"><AlertIcon />Failed to load user.</Alert>;
  if (!user) return <Alert status="error"><AlertIcon />User not found.</Alert>;

  return (
    <Box className="w-full max-w-md mx-auto p-4">
      <h2 className="text-lg font-bold mb-4">Change Manager</h2>
      <form onSubmit={e => { e.preventDefault(); mutation.mutate(managerId); }} className="space-y-4">
        <FormLabel>First Name</FormLabel>
        <Input value={user.firstName || ''} isReadOnly />
        <FormLabel>Last Name</FormLabel>
        <Input value={user.lastName || ''} isReadOnly />
        <FormLabel>Email</FormLabel>
        <Input value={user.email || ''} isReadOnly />
        <FormLabel>Department</FormLabel>
        <Input value={user.department || ''} isReadOnly />
        <FormLabel>Job Title</FormLabel>
        <Input value={user.jobTitle || ''} isReadOnly />
        <FormLabel>Manager</FormLabel>
        <Select value={managerId} onChange={e => setManagerId(e.target.value)} required>
          {managers?.map((m: any) => (
            <option key={m.id} value={m.id}>{m.firstName || m.name || ''} {m.lastName || ''} ({m.email})</option>
          ))}
        </Select>
        <Box display="flex" gap={2} mt={4}>
          <Button type="submit" colorScheme="blue" isLoading={mutation.isLoading}>Save</Button>
          <Button onClick={() => navigate('/user-management')}>Cancel</Button>
        </Box>
      </form>
    </Box>
  );
};
