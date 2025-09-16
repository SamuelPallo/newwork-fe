import React from 'react';
import { Box, Button, Flex, Heading, Input, useToast } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { login } from '../api';
import { useAuthStore } from '../hooks/useAuthStore';
import { useQueryClient } from '@tanstack/react-query';

interface LoginForm {
  email: string;
  password: string;
}

export const LoginPage: React.FC = () => {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<LoginForm>();
  const toast = useToast();
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const setToken = useAuthStore((state) => state.setToken);

  // Remove automatic redirect to /me on token presence

  const refreshAuth = useAuthStore((state) => state.refreshAuth);
  const queryClient = useQueryClient();
  const onSubmit = async (data: LoginForm) => {
    try {
      const { accessToken, refreshToken } = await login({ email: data.email, password: data.password });
      await setToken(accessToken);
      refreshAuth();
      // Force profile refetch before navigating
      await queryClient.refetchQueries({ queryKey: ['me'] });
      navigate('/me', { replace: true });
    } catch (err: any) {
      toast({
        title: 'Login failed',
        description: err?.message || 'Invalid credentials',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50">
      <Box bg="white" p={8} rounded="md" shadow="md" w="full" maxW="sm">
        <Heading mb={6} size="lg" textAlign="center">Sign in</Heading>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input
            placeholder="Email"
            mb={4}
            type="email"
            {...register('email', { required: true })}
            autoComplete="email"
          />
          <Input
            placeholder="Password"
            mb={6}
            type="password"
            {...register('password', { required: true })}
            autoComplete="current-password"
          />
          <Button
            colorScheme="blue"
            w="full"
            type="submit"
            isLoading={isSubmitting}
          >
            Login
          </Button>
        </form>
      </Box>
    </Flex>
  );
};
