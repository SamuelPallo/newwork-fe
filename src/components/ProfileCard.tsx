import React from 'react';
import { Box, Spinner, Text, Heading, Alert, AlertIcon } from '@chakra-ui/react';
import { useUser } from '../hooks/useUser';

export const ProfileCard: React.FC = () => {
  const { profile, loading, error } = useUser();

  if (loading) return <Spinner size="xl" />;
  if (error) return <Alert status="error"><AlertIcon />Failed to load profile</Alert>;
  if (!profile) return <Text>No profile data.</Text>;

  return (
    <Box className="profile-card" p={6} bg="white" rounded="md" shadow="md" maxW="md" mx="auto">
      <Heading size="md" mb={2}>{profile.name || profile.email}</Heading>
      <Text>Email: {profile.email}</Text>
      {/* Add more fields as needed */}
    </Box>
  );
};
