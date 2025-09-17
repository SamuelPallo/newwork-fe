import React, { useState, useEffect } from 'react';
import { Box, Textarea, Button, Select, Spinner, useToast } from '@chakra-ui/react';
import { useAuth } from '../hooks/useAuth';
import { useAddFeedback } from '../hooks/useAddFeedback';
import { getUsers } from '../api/userApi';

export const FeedbackComposer: React.FC = () => {
  const [authReady, setAuthReady] = useState(false);
  const { user, userId, token, activeRole } = useAuth();
  console.log('FeedbackComposer user:', user, 'userId:', userId);
  const effectiveUserId = userId || user?.userId;
  const [content, setContent] = useState('');
  const [model, setModel] = useState('default');
  // Scope options by role
  const isManager = activeRole === 'ROLE_MANAGER';
  const isAdmin = activeRole === 'ROLE_ADMIN';
  const isEmployee = activeRole === 'ROLE_EMPLOYEE';
  const [scope, setScope] = useState<'team' | 'all' | 'managed'>(isManager ? 'team' : 'team');
  const [users, setUsers] = useState<any[]>([]);
  const [targetUserId, setTargetUserId] = useState('');
  const toast = useToast();
  const { mutate: addFeedback, status } = useAddFeedback();
  const adding = status === 'loading';

  useEffect(() => {
    async function fetchUsers() {
      if (!effectiveUserId) {
        setAuthReady(false);
        setUsers([]);
        return;
      }
      setAuthReady(true);
      try {
        let data = [];
        if (isManager) {
          if (scope === 'all') {
            data = await getUsers(token);
          } else if (scope === 'managed') {
            const endpoint = `/api/v1/users/team/${effectiveUserId}?scope=managed`;
            const res = await fetch(endpoint, {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            data = await res.json();
          } else {
            const endpoint = `/api/v1/users/team/${effectiveUserId}?scope=team`;
            const res = await fetch(endpoint, {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            data = await res.json();
          }
        } else {
          // Employee/Admin
          if (scope === 'all') {
            data = await getUsers(token);
          } else {
            const endpoint = `/api/v1/users/team/${effectiveUserId}?scope=team`;
            const res = await fetch(endpoint, {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            data = await res.json();
          }
        }
        // Remove current user from the list
        data = Array.isArray(data) ? data.filter(u => u.id !== effectiveUserId) : data;
        setUsers(data);
      } catch (err) {
        setUsers([]);
      }
    }
    fetchUsers();
  }, [scope, effectiveUserId, activeRole]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserId) {
      toast({ title: 'Select a user', status: 'warning', duration: 1500 });
      return;
    }
    addFeedback(
      { content, model, targetUserId },
      {
        onSuccess: () => {
          toast({ title: 'Feedback added', status: 'success', duration: 1500 });
          setContent('');
          setTargetUserId('');
        },
        onError: (err: any) => {
          let message = 'Failed to add feedback';
          if (err?.message) message = err.message;
          if (err?.detail) message = err.detail;
          toast({ title: 'Error', description: message, status: 'error', duration: 2000 });
        },
      }
    );
  };

  return (
    <Box className="feedback-composer" p={4} bg="white" rounded="md" shadow="md" maxW="md" mx="auto">
      {!authReady ? (
        <Spinner size="lg" mt={8} />
      ) : !effectiveUserId ? (
        <Box textAlign="center" mt={8} color="red.500">
          Error: Cannot load feedback composer. User ID is missing.<br />
          <Button mt={4} onClick={() => window.location.reload()}>Retry</Button>
        </Box>
      ) : Array.isArray(users) && users.length === 0 ? (
        <Box textAlign="center" mt={8} color="gray.500">
          No users available for feedback.<br />
          <Button mt={4} onClick={() => window.location.reload()}>Retry</Button>
        </Box>
      ) : Array.isArray(users) ? (
        <form onSubmit={handleSubmit}>
          <Select mb={3} value={scope} onChange={e => setScope(e.target.value as 'team' | 'all' | 'managed')} isDisabled={adding}>
            <option value="team">My team</option>
            <option value="all">All users</option>
            {isManager && <option value="managed">Managed team</option>}
          </Select>
          <Select mb={3} value={targetUserId} onChange={e => setTargetUserId(e.target.value)} isDisabled={adding}>
            <option value="">Select user...</option>
            {users.map(u => (
              <option key={u.id || u.userId || u.sub} value={u.id || u.userId || u.sub}>
                {u.firstName || u.name || ''} {u.lastName || ''} ({u.email})
              </option>
            ))}
          </Select>
          <Textarea
            placeholder="Write feedback..."
            value={content}
            onChange={e => setContent(e.target.value)}
            mb={3}
            isDisabled={adding}
          />
          <Select mb={3} value={model} onChange={e => setModel(e.target.value)} isDisabled={adding}>
            <option value="default">No model (raw)</option>
            <option value="hf-model">Polish with HuggingFace</option>
          </Select>
          <Button
            colorScheme="blue"
            type="submit"
            isLoading={adding && model !== 'default'}
            w="full"
          >
            {model !== 'default' ? 'Polish & Submit' : 'Submit'}
          </Button>
          {adding && model !== 'default' && <Spinner mt={2} />}
        </form>
      ) : (
        <Box textAlign="center" mt={8} color="red.500">
          Error: Could not load users.<br />
          <Button mt={4} onClick={() => window.location.reload()}>Retry</Button>
        </Box>
      )}
    </Box>
  );
};
