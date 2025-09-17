import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { Box, Input, Text, Heading, Spinner, Alert, AlertIcon } from '@chakra-ui/react';

export const UserProfileView: React.FC = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const res = await fetch(`/api/v1/users/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to fetch user');
      return res.json();
    },
    enabled: !!id && !!token
  });

  if (isLoading) return <Box p={8} textAlign="center"><Spinner size="lg" /><div>Loading...</div></Box>;
  if (error) return <Alert status="error"><AlertIcon />Failed to load user.</Alert>;
  if (!user) return <Alert status="error"><AlertIcon />User not found.</Alert>;

  return (
    <Box className="w-full max-w-md mx-auto p-4">
      <Heading size="md" mb={4}>User Profile</Heading>
      <Text mb={1}><b>Name:</b> {(user.firstName || '') + ' ' + (user.lastName || '')}</Text>
      <Text mb={1}><b>Email:</b> {user.email}</Text>
      <Text mb={1}><b>Job Title:</b> {user.jobTitle}</Text>
      <Text mb={1}><b>Department:</b> {user.department}</Text>
      <Text mb={1}><b>Manager:</b> {user.managerName ?? 'None'}</Text>
      <Text mb={1}><b>Active:</b> {user.isActive ? 'Yes' : 'No'}</Text>
      <Text mb={1}><b>Hire Date:</b> {user.hireDate}</Text>
      <Text mb={1}><b>Role:</b> {Array.isArray(user.roles) ? user.roles.join(', ') : user.roles}</Text>
      <Text mt={2} fontWeight="bold">Sensitive Data</Text>
      <Text mb={1}><b>Phone:</b> {user.sensitiveData?.phone ?? '-'}</Text>
      <Text mb={1}><b>Address:</b> {user.sensitiveData?.address ?? '-'}</Text>
      <Text mb={1}><b>Salary:</b> {user.sensitiveData?.salary ?? '-'}</Text>
      <Box mt={4}>
        <button onClick={() => navigate(-1)} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Back</button>
      </Box>
    </Box>
  );
};
