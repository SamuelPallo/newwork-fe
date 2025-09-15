
import React, { useState, useCallback } from 'react';
import { Box, Spinner, Text, Heading, Alert, AlertIcon, Input, Button, useToast, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@chakra-ui/react';
import { useUser } from '../hooks/useUser';
import { useAuth } from '../hooks/useAuth';
import debounce from 'lodash.debounce';

// Presentational component
const ProfileFields = ({ profile, editable, onFieldChange, saving }: any) => (
  <>
    <Heading size="md" mb={2}>{profile.name || profile.email}</Heading>
    <Text>Email: {profile.email}</Text>
    {editable ? (
      <Box mt={4}>
        <Text fontWeight="bold">Full Name:</Text>
        <Input
          defaultValue={profile.name || ''}
          onChange={e => onFieldChange('name', e.target.value)}
          mb={2}
          isDisabled={saving}
        />
        {/* Add more editable fields as needed */}
        {saving && <Text color="blue.500">Saving...</Text>}
      </Box>
    ) : (
      <Box mt={4}>
        <Text>Department: {profile.department || 'N/A'}</Text>
        {/* Show more fields for manager/owner */}
      </Box>
    )}
  </>
);

export const ProfileCard: React.FC = () => {
  const { profile, loading, error } = useUser();
  const { user, isManager, isOwner } = useAuth();
  console.log('ProfileCard:', { profile, loading, error, user });
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [localProfile, setLocalProfile] = useState<any>(null);

  React.useEffect(() => {
    setLocalProfile(profile);
  }, [profile]);

  // Only owner can edit their own profile
  const editable = profile && user && isOwner(profile.id);

  // Modal state for confirmation
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [pendingField, setPendingField] = useState<string | null>(null);
  const [pendingValue, setPendingValue] = useState<any>(null);

  // Debounced save function
  const saveField = useCallback(
    debounce(async (field: string, value: any) => {
      setSaving(true);
      try {
        await fetch(`/api/v1/users/${profile.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.token}`,
          },
          body: JSON.stringify({ [field]: value }),
        });
        toast({ title: 'Profile updated', status: 'success', duration: 1500 });
      } catch (err) {
        toast({ title: 'Failed to update', status: 'error', duration: 2000 });
      } finally {
        setSaving(false);
      }
    }, 500),
    [profile, user, toast]
  );

  const handleFieldChange = (field: string, value: any) => {
    setPendingField(field);
    setPendingValue(value);
    onOpen();
  };

  const confirmChange = () => {
    setLocalProfile((prev: any) => ({ ...prev, [pendingField!]: pendingValue }));
    saveField(pendingField!, pendingValue);
    onClose();
  };

  // Render logic for loading, error, or profile
  if (loading) {
    return <Box p={6} textAlign="center"><Spinner size="xl" /> <Text mt={2}>Loading profile...</Text></Box>;
  }
  if (error) {
    return <Alert status="error"><AlertIcon />{error instanceof Error ? error.message : 'Failed to load profile.'}</Alert>;
  }
  if (!profile) {
    return <Box p={6} textAlign="center"><Text>No profile data found.</Text></Box>;
  }

  // Role-aware: show sensitive fields only to self or higher role
  const isSelf = user && profile && user.id === profile.id;
  const canSeeSensitive = isSelf || (user && user.role && user.role !== 'USER');

  return (
    <Box className="profile-card" p={6} bg="white" rounded="md" shadow="md" maxW="md" mx="auto">
      <Heading size="md" mb={2}>{profile.first_name} {profile.last_name}</Heading>
      <Text mb={1}><b>Email:</b> {profile.email}</Text>
      <Text mb={1}><b>Job Title:</b> {profile.jobTitle || profile.job_title}</Text>
      <Text mb={1}><b>Department:</b> {profile.department}</Text>
      <Text mb={1}><b>Manager:</b> {profile.manager?.firstName || profile.manager?.first_name || 'None'}</Text>
      <Text mb={1}><b>Active:</b> {profile.isActive ? 'Yes' : 'No'}</Text>
      <Text mb={1}><b>Hire Date:</b> {profile.hireDate || profile.hire_date}</Text>
      <Text mb={1}><b>Role:</b> {profile.role}</Text>
      {canSeeSensitive && (
        <>
          <Text mt={2} fontWeight="bold">Sensitive Data</Text>
          <Text mb={1}><b>Phone:</b> {profile.sensitiveData?.phone || profile.sensitive_data?.phone || '-'}</Text>
          <Text mb={1}><b>Address:</b> {profile.sensitiveData?.address || profile.sensitive_data?.address || '-'}</Text>
          <Text mb={1}><b>Salary:</b> {profile.sensitiveData?.salary || profile.sensitive_data?.salary || '-'}</Text>
        </>
      )}
      {/* Optionally show subordinates or other info here */}
    </Box>
  );
};
