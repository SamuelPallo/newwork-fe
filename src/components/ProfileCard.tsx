
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
              Authorization: `Bearer ${user?.token}`,
            },
            body: JSON.stringify({ [field]: value }),
          });
          toast({ title: 'Profile updated', status: 'success', duration: 1500 });
        } catch {
          toast({ title: 'Failed to update', status: 'error', duration: 2000 });
        }
        setSaving(false);
      }, 800),
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

  if (loading) return <Spinner size="xl" />;
  if (error) return <Alert status="error"><AlertIcon />Failed to load profile</Alert>;
  if (!profile) return <Text>No profile data.</Text>;

  // Role-aware: managers/owners see more fields, others see limited
  return (
    <Box className="profile-card" p={6} bg="white" rounded="md" shadow="md" maxW="md" mx="auto">
      <ProfileFields
        profile={localProfile || profile}
        editable={editable}
        onFieldChange={handleFieldChange}
        saving={saving}
      />
      {/* Add more role-aware fields and actions as needed */}

      {/* Confirmation Modal for profile changes */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Profile Change</ModalHeader>
          <ModalBody>
            Are you sure you want to update your profile field?
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose} mr={3} aria-label="Cancel">Cancel</Button>
            <Button colorScheme="blue" onClick={confirmChange} aria-label="Confirm Save">Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};
