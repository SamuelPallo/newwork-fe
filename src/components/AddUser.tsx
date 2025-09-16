import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMutation } from '@tanstack/react-query';
import { addUser } from '../api/userApi';
import { Box, Input, Button, Alert, AlertIcon, FormLabel, Select, Checkbox } from '@chakra-ui/react';
import { RoleInput } from './RoleInput';
import { useNavigate } from 'react-router-dom';

export const AddUser: React.FC = () => {
  // Only one set of handlers
  const addRole = (role: string) => {
    if (!form.roles.includes(role)) {
      setForm({ ...form, roles: [...form.roles, role] });
    }
  };
  const removeRole = (role: string) => {
    if (role !== 'ROLE_EMPLOYEE') {
      setForm({ ...form, roles: form.roles.filter((r: string) => r !== role) });
    }
  };
  const { token, activeRole } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = React.useState<AddUserForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    jobTitle: '',
    department: '',
    hireDate: '',
    roles: ['ROLE_EMPLOYEE'],
    salary: '',
    password: '',
    isActive: true,
  });
  const [error, setError] = React.useState<string | null>(null);
  type AddUserForm = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    jobTitle: string;
    department: string;
    hireDate: string;
    roles: string[];
    salary: string;
    password: string;
    isActive: boolean;
  };

  const mutation = useMutation({
    mutationFn: (form: AddUserForm) => {
      // Map form fields to API payload, ensure salary is a number
      const payload: any = {
        name: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email,
        department: form.department,
        roles: form.roles,
        password: form.password,
        jobTitle: form.jobTitle,
        hireDate: form.hireDate,
        isActive: form.isActive,
      };
      if (form.phone || form.address || form.salary) {
        payload.sensitiveData = {
          phone: form.phone || '',
          address: form.address || '',
          salary: form.salary ? Number(form.salary) : '',
        };
      }
      return addUser(payload);
    },
    onError: (err: any) => setError(err?.message || 'Failed to add user'),
    onSuccess: () => {
      setForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        jobTitle: '',
        department: '',
        hireDate: '',
        roles: ['ROLE_EMPLOYEE'],
        salary: '',
        password: '',
        isActive: true,
      });
      navigate('/user-management');
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, type, value } = e.target;
    if (type === 'checkbox' && e.target instanceof HTMLInputElement) {
      setForm({
        ...form,
        [name]: e.target.checked,
      });
    } else {
      setForm({
        ...form,
        [name]: value,
      });
    }
  };

  // Remove duplicate/unused role logic

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!token) {
      setError('Authentication token missing. Please log in again.');
      return;
    }
    mutation.mutate(form);
  };

  return (
    <Box className="w-full max-w-md mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormLabel>First Name</FormLabel>
        <Input name="firstName" value={form.firstName} onChange={handleChange} required />
        <FormLabel>Last Name</FormLabel>
        <Input name="lastName" value={form.lastName} onChange={handleChange} required />
        <FormLabel>Email</FormLabel>
        <Input name="email" value={form.email} onChange={handleChange} required type="email" />
        <FormLabel>Phone</FormLabel>
        <Input name="phone" value={form.phone} onChange={handleChange} />
        <FormLabel>Address</FormLabel>
        <Input name="address" value={form.address} onChange={handleChange} />
        <FormLabel>Job Title</FormLabel>
        <Input name="jobTitle" value={form.jobTitle} onChange={handleChange} />
        <FormLabel>Department</FormLabel>
        <Input name="department" value={form.department} onChange={handleChange} required />
        <FormLabel>Hire Date</FormLabel>
        <Input name="hireDate" value={form.hireDate} onChange={handleChange} type="date" />
        <FormLabel>Roles</FormLabel>
        <RoleInput roles={form.roles} activeRole={activeRole ?? 'ROLE_EMPLOYEE'} onAdd={addRole} onRemove={removeRole} />
        <FormLabel>Salary</FormLabel>
        <Input name="salary" value={form.salary} onChange={handleChange} type="number" step="any" />
        <FormLabel>Password</FormLabel>
        <Input name="password" value={form.password} onChange={handleChange} required type="password" />
        <Checkbox name="isActive" isChecked={form.isActive} onChange={handleChange} mb={4}>
          Active
        </Checkbox>
        <br />
        <Button type="submit" colorScheme="blue" isLoading={mutation.isLoading} mt={2}>Add User</Button>
        {error && <Alert status="error"><AlertIcon />{error}</Alert>}
        {mutation.isSuccess && <Alert status="success"><AlertIcon />User added successfully!</Alert>}
      </form>
    </Box>
  );
};
