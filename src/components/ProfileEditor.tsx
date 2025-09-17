import { getHighestRole } from '../utils';
import React from 'react';
import { Box, Button, Input, FormControl, FormLabel, Heading, useToast, Spinner, Alert, AlertIcon, Checkbox } from '@chakra-ui/react';
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
      firstName: profile?.firstName || profile?.first_name || '',
      lastName: profile?.lastName || profile?.last_name || '',
      email: profile?.email || '',
      phone: (profile?.sensitiveData?.phone || profile?.sensitive_data?.phone || ''),
      address: (profile?.sensitiveData?.address || profile?.sensitive_data?.address || ''),
      hireDate: profile?.hireDate || profile?.hire_date || '',
      isActive: Boolean(profile?.isActive ?? profile?.active ?? true),
    };
  }

  const { register, handleSubmit, formState: { isSubmitting }, reset, watch } = useForm({
    defaultValues: getFormValues(profile),
  });

  React.useEffect(() => {
    if (profile) {
      reset(getFormValues(profile));
    }
  }, [profile, reset]);

  const onSubmit = async (data: any) => {
    // Prepare payload: match backend DTOs, only camelCase keys
    const payload = {
      id: profile.id,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      jobTitle: profile.jobTitle ?? profile.job_title ?? '',
      department: profile.department ?? '',
      managerId: profile.managerId ?? profile.manager_id ?? '',
      managerName: profile.managerName ?? '',
      isActive: profile.isActive ?? profile.active ?? true,
      hireDate: profile.hireDate ?? profile.hire_date ?? '',
      role: profile.role === 'USER' ? 'EMPLOYEE' : profile.role,
      sensitiveData: {
        phone: data.phone,
        address: data.address,
        salary: profile.sensitiveData?.salary ?? profile.sensitive_data?.salary ?? '',
      },
    };
    let token = user?.token;
    if (!token) {
      token = tokenService.getToken();
    }
    try {
      // Flatten payload (no sensitiveData)
      const flatPayload = {
        ...payload,
        phone: payload.sensitiveData?.phone || '',
        address: payload.sensitiveData?.address || '',
        salary: payload.sensitiveData?.salary || '',
      };
      if ('sensitiveData' in flatPayload) {
        delete (flatPayload as any).sensitiveData;
      }
      const res = await fetch(`/api/v1/users/${profile.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(flatPayload),
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
        {/* Read-only fields for info */}
        <FormControl mb={4} isReadOnly>
          <FormLabel>Job Title</FormLabel>
          <Input value={profile?.jobTitle || profile?.job_title || ''} isReadOnly />
        </FormControl>
        <FormControl mb={4} isReadOnly>
          <FormLabel>Department</FormLabel>
          <Input value={profile?.department || ''} isReadOnly />
        </FormControl>
        <FormControl mb={4} isReadOnly={!(user?.roles?.includes('ROLE_MANAGER') || user?.roles?.includes('ROLE_ADMIN'))}>
          <FormLabel>Hire Date</FormLabel>
          {user?.roles?.includes('ROLE_MANAGER') || user?.roles?.includes('ROLE_ADMIN') ? (
            <Input type="date" defaultValue={profile?.hireDate || profile?.hire_date || ''} {...register('hireDate')} />
          ) : (
            <Input value={profile?.hireDate || profile?.hire_date || ''} isReadOnly />
          )}
        </FormControl>
        <FormControl mb={4} isReadOnly>
          <FormLabel>Role</FormLabel>
          <Input value={getHighestRole(profile?.roles)} isReadOnly />
        </FormControl>
        <FormControl mb={4} isReadOnly>
          <FormLabel>Salary</FormLabel>
          <Input value={profile?.sensitiveData?.salary || profile?.sensitive_data?.salary || ''} isReadOnly />
        </FormControl>
        <FormControl mb={4}>
          <Checkbox {...register('isActive')} isChecked={watch('isActive')} isDisabled>
            Active
          </Checkbox>
        </FormControl>
        <Button colorScheme="blue" type="submit" isLoading={isSubmitting} w="full">Save Changes</Button>
      </form>
    </Box>
  );
};
