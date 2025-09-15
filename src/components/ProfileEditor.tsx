import React from 'react';
import { Box, Button, Input, FormControl, FormLabel, Heading, useToast, Spinner, Alert, AlertIcon } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useUser } from '../hooks/useUser';
import { useAuth } from '../hooks/useAuth';
import { tokenService } from '../services/tokenService';


export const ProfileEditor: React.FC = () => {
  const { profile, loading, error } = useUser();
  const { user } = useAuth();
  const toast = useToast();
  // Only allow editing for these fields for USER role
  const editableFields = ['first_name', 'last_name', 'email'];
  // Sensitive fields editable for USER
  const editableSensitive = ['phone', 'address'];


  // Defensive mapping for form values
  function getFormValues(profile: any) {
    return {
      first_name: profile?.first_name || profile?.firstName || '',
      last_name: profile?.last_name || profile?.lastName || '',
      email: profile?.email || '',
      phone: (profile?.sensitive_data?.phone || profile?.sensitiveData?.phone || ''),
      address: (profile?.sensitive_data?.address || profile?.sensitiveData?.address || ''),
    };
  }

  const { register, handleSubmit, formState: { isSubmitting }, reset } = useForm({
    defaultValues: getFormValues(profile),
  });

  React.useEffect(() => {
    if (profile) {
      reset(getFormValues(profile));
    }
  }, [profile, reset]);

  const onSubmit = async (data: any) => {
    // Prepare payload: merge sensitive_data
    const payload = {
      ...profile,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      sensitive_data: {
        ...profile.sensitive_data,
        phone: data.phone,
        address: data.address,
      },
    };
    // Try to get token from user, fallback to tokenService
    let token = user?.token;
    if (!token) {
      token = tokenService.getToken();
    }
    console.log('ProfileEditor PUT token:', token);
    console.log('ProfileEditor PUT payload:', payload);
    try {
      const res = await fetch(`/api/v1/users/${profile.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to update profile');
      toast({ title: 'Profile updated', status: 'success', duration: 2000 });
    } catch (err: any) {
      toast({ title: 'Update failed', description: err.message, status: 'error', duration: 3000 });
    }
  };

  if (loading) return <Box p={6} textAlign="center"><Spinner size="xl" /> <span>Loading profile...</span></Box>;
  if (error) return <Alert status="error"><AlertIcon />Failed to load profile</Alert>;
  if (!profile) return <Box p={6} textAlign="center">No profile data found.</Box>;

  return (
    <Box className="profile-editor" p={6} maxW="md" mx="auto" bg="white" rounded="md" shadow="md">
      <Heading size="md" mb={4}>Edit Profile</Heading>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormControl mb={4}>
          <FormLabel>First Name</FormLabel>
          <Input {...register('first_name', { required: true })} />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>Last Name</FormLabel>
          <Input {...register('last_name', { required: true })} />
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
        {/* Read-only fields for info */}
        <FormControl mb={4} isReadOnly>
          <FormLabel>Job Title</FormLabel>
          <Input value={profile?.jobTitle || profile?.job_title || ''} isReadOnly />
        </FormControl>
        <FormControl mb={4} isReadOnly>
          <FormLabel>Department</FormLabel>
          <Input value={profile?.department || ''} isReadOnly />
        </FormControl>
        <FormControl mb={4} isReadOnly>
          <FormLabel>Hire Date</FormLabel>
          <Input value={profile?.hireDate || profile?.hire_date || ''} isReadOnly />
        </FormControl>
        <FormControl mb={4} isReadOnly>
          <FormLabel>Role</FormLabel>
          <Input value={profile?.role || ''} isReadOnly />
        </FormControl>
        <FormControl mb={4} isReadOnly>
          <FormLabel>Salary</FormLabel>
          <Input value={profile?.sensitiveData?.salary || profile?.sensitive_data?.salary || ''} isReadOnly />
        </FormControl>
        <Button colorScheme="blue" type="submit" isLoading={isSubmitting} w="full">Save Changes</Button>
      </form>
    </Box>
  );
};
