import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { addUser } from '../api/userApi';
import { Box, Input, Button, Alert, AlertIcon, FormLabel, Select } from '@chakra-ui/react';

export const AddUser: React.FC = () => {
  const [form, setForm] = React.useState({
    name: '',
    email: '',
    department: '',
    roles: 'ROLE_EMPLOYEE',
    password: '',
  });
  const [error, setError] = React.useState<string | null>(null);
  const mutation = useMutation({
    mutationFn: addUser,
    onError: (err: any) => setError(err?.message || 'Failed to add user'),
    onSuccess: () => setForm({ name: '', email: '', department: '', roles: 'ROLE_EMPLOYEE', password: '' }),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    mutation.mutate(form);
  };

  return (
    <Box className="w-full max-w-md mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormLabel>Name</FormLabel>
        <Input name="name" value={form.name} onChange={handleChange} required />
        <FormLabel>Email</FormLabel>
        <Input name="email" value={form.email} onChange={handleChange} required type="email" />
        <FormLabel>Department</FormLabel>
        <Input name="department" value={form.department} onChange={handleChange} required />
        <FormLabel>Role</FormLabel>
        <Select name="roles" value={form.roles} onChange={handleChange} required>
          <option value="ROLE_EMPLOYEE">Employee</option>
          <option value="ROLE_MANAGER">Manager</option>
          <option value="ROLE_ADMIN">Admin</option>
        </Select>
        <FormLabel>Password</FormLabel>
        <Input name="password" value={form.password} onChange={handleChange} required type="password" />
        <Button type="submit" colorScheme="blue" isLoading={mutation.isLoading}>Add User</Button>
        {error && <Alert status="error"><AlertIcon />{error}</Alert>}
        {mutation.isSuccess && <Alert status="success"><AlertIcon />User added successfully!</Alert>}
      </form>
    </Box>
  );
};
