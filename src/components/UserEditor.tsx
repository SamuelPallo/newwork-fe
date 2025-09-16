import React from 'react';
import { Box, Button, Input, FormControl, FormLabel, Heading, useToast, Spinner, Alert, AlertIcon, Checkbox } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
// ...existing code...
import { useAuthStore } from '../hooks/useAuthStore';
import { useAuth } from '../hooks/useAuth';
import { useQuery, useMutation } from '@tanstack/react-query';

export const UserEditor: React.FC = () => {
  const { token: authToken } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  // Fetch user details by id (full details)
  // Get token from Zustand store
  const token = useAuthStore((state) => state.token);
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const res = await fetch(`/api/v1/users/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to fetch user');
      return res.json();
    },
    enabled: !!id,
  });

  // Defensive mapping for form values
  function getFormValues(user: any) {
    return {
      firstName: user?.firstName || user?.first_name || '',
      lastName: user?.lastName || user?.last_name || '',
      email: user?.email || '',
      phone: user?.sensitiveData?.phone || user?.phone || '',
      address: user?.sensitiveData?.address || user?.address || '',
      jobTitle: user?.jobTitle || user?.job_title || '',
      department: user?.department || '',
      hireDate: user?.hireDate || user?.hire_date || '',
      roles: Array.isArray(user?.roles) ? user.roles : user?.roles ? [user.roles] : ['ROLE_EMPLOYEE'],
      salary: user?.sensitiveData?.salary || user?.salary || '',
      isActive: user?.isActive ?? true,
    };
  }

  const { register, handleSubmit, formState: { isSubmitting }, reset, setValue, watch } = useForm({
    defaultValues: getFormValues(user),
  });
  const roles = watch('roles');
  const isActive = watch('isActive');
  // Role chip/card logic
  const allRoles = [
    { value: 'ROLE_EMPLOYEE', label: 'Employee' },
    { value: 'ROLE_MANAGER', label: 'Manager' },
    { value: 'ROLE_ADMIN', label: 'Admin' },
  ];
  // Assume current user's highest role is available from useAuth
  const { user: currentUser } = useAuth();
  const myRoles = Array.isArray(currentUser?.roles) ? currentUser.roles : currentUser?.roles ? [currentUser.roles] : [];
  const myHighestRole = myRoles.includes('ROLE_ADMIN') ? 'ROLE_ADMIN' : myRoles.includes('ROLE_MANAGER') ? 'ROLE_MANAGER' : 'ROLE_EMPLOYEE';
  const canEditRole = (role: string) => {
  // Employee cannot be removed by manager
  if (role === 'ROLE_EMPLOYEE') return false;
  if (myHighestRole === 'ROLE_ADMIN') return true;
  if (myHighestRole === 'ROLE_MANAGER' && role === 'ROLE_MANAGER') return true;
  return false;
  };
  const addRole = (role: string) => {
    if (!roles.includes(role)) {
      setValue('roles', [...roles, role]);
    }
  };
  const removeRole = (role: string) => {
    if (role !== 'ROLE_EMPLOYEE' && canEditRole(role)) {
      setValue('roles', roles.filter((r: string) => r !== role));
    }
  };

  React.useEffect(() => {
    if (user) {
      reset(getFormValues(user));
    }
  }, [user, reset]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (!authToken) {
        throw new Error('Authentication token missing. Please log in again.');
      }
      // Prepare payload
      const payload: any = {
        ...data,
        roles: data.roles,
        isActive: data.isActive,
      };
      payload.sensitiveData = {
        phone: data.phone || '',
        address: data.address || '',
        salary: data.salary || '',
      };
      const res = await fetch(`/api/v1/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to update user');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: 'User updated', status: 'success', duration: 2000 });
      navigate('/user-management');
    },
    onError: (err: any) => {
      toast({ title: 'Update failed', description: err.message, status: 'error', duration: 3000 });
    },
  });

  const onSubmit = (data: any) => {
    mutation.mutate(data);
  };

  if (isLoading) return <Box p={6} textAlign="center"><Spinner size="xl" /> <span>Loading user...</span></Box>;
  if (error) return <Alert status="error"><AlertIcon />Failed to load user</Alert>;
  if (!user) return <Box p={6} textAlign="center">No user data found.</Box>;

  return (
    <Box className="user-editor" p={6} maxW="md" mx="auto" bg="white" rounded="md" shadow="md">
      <Heading size="md" mb={4}>Edit User</Heading>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormControl mb={4}>
          <FormLabel>First Name</FormLabel>
          <Input {...register('firstName', { required: true })} />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>Last Name</FormLabel>
          <Input {...register('lastName', { required: true })} />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>Email</FormLabel>
          <Input type="email" {...register('email', { required: true })} />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>Phone</FormLabel>
          <Input {...register('phone')} />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>Address</FormLabel>
          <Input {...register('address')} />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>Job Title</FormLabel>
          <Input {...register('jobTitle')} />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>Department</FormLabel>
          <Input {...register('department')} />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>Hire Date</FormLabel>
          <Input type="date" {...register('hireDate')} />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>Roles</FormLabel>
          <Box mb={2} display="flex" gap={2} flexWrap="wrap">
            {roles && roles.map((role: string) => {
              const label = allRoles.find(r => r.value === role)?.label || role;
              // For manager editing, allow X only on Manager role
              const showX = (myHighestRole === 'ROLE_MANAGER' && role === 'ROLE_MANAGER') || (myHighestRole === 'ROLE_ADMIN' && role !== 'ROLE_EMPLOYEE');
              return (
                <Box key={role} px={3} py={1} bg="gray.200" borderRadius="md" display="flex" alignItems="center" gap={1}>
                  <span>{label}</span>
                  {showX && (
                    <Button size="xs" ml={1} onClick={() => removeRole(role)} aria-label={`Remove ${label}`}>x</Button>
                  )}
                </Box>
              );
            })}
          </Box>
          <Box mb={2} display="flex" gap={2}>
            {(() => {
              // Manager logic for add buttons
              if (myHighestRole === 'ROLE_MANAGER') {
                // If user only has Employee, show only Manager to add
                if (roles?.length === 1 && roles[0] === 'ROLE_EMPLOYEE') {
                  return <Button key="ROLE_MANAGER" size="xs" onClick={() => addRole('ROLE_MANAGER')}>Manager</Button>;
                }
                // If user has Employee and Manager, show Manager to add only if removed
                if (roles?.includes('ROLE_EMPLOYEE') && !roles?.includes('ROLE_MANAGER')) {
                  return <Button key="ROLE_MANAGER" size="xs" onClick={() => addRole('ROLE_MANAGER')}>Manager</Button>;
                }
                // No add buttons if both present
                return null;
              }
              // Admin logic: show all not present
              if (myHighestRole === 'ROLE_ADMIN') {
                return allRoles.filter(r => !roles?.includes(r.value)).map(r => (
                  <Button key={r.value} size="xs" onClick={() => addRole(r.value)}>{r.label}</Button>
                ));
              }
              // Employee: no add buttons
              return null;
            })()}
          </Box>
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>Salary</FormLabel>
          <Input type="number" step="any" {...register('salary', { valueAsNumber: true })} />
        </FormControl>
        <FormControl mb={4}>
          <Checkbox {...register('isActive')} isChecked={isActive} onChange={e => setValue('isActive', e.target.checked)}>
            Active
          </Checkbox>
        </FormControl>
        <Button colorScheme="blue" type="submit" isLoading={isSubmitting} w="full">Save Changes</Button>
      </form>
    </Box>
  );
};
