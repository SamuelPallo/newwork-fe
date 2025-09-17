import React from 'react';
import { Box, Text, Spinner, Alert, AlertIcon, Button, Textarea } from '@chakra-ui/react';
import { useAuth } from '../hooks/useAuth';
import { useFeedback } from '../hooks/useFeedback';
import { useQueryClient } from '@tanstack/react-query';

export const FeedbackList: React.FC = () => {
  const { userId, token, user, activeRole } = useAuth();
  const safeUserId: string | undefined = userId !== null && typeof userId === 'string' ? userId : undefined;
  const { feedbackList, loading, error, addFeedback } = useFeedback(safeUserId, token ?? undefined);
  const queryClient = useQueryClient();
  const refetchFeedback = () => queryClient.invalidateQueries(['feedback', safeUserId, token]);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editText, setEditText] = React.useState<string>('');
  const [editLoading, setEditLoading] = React.useState(false);
  const [editError, setEditError] = React.useState<string | null>(null);
  // Track model per feedback being edited
  const [editModels, setEditModels] = React.useState<{ [id: string]: string }>({});

  if (loading) return <Spinner size="lg" />;
  if (error) {
    let message = 'Failed to load feedback';
    const err = error as any;
    if (err?.message) message = err.message;
    if (err?.detail) message = err.detail;
    return <Alert status="error"><AlertIcon />{message}</Alert>;
  }
  if (!feedbackList.length) return <Text>No feedback yet.</Text>;

  function canEditFeedback(fb: any) {
    return fb.authorId === userId;
  }

  async function handleEditSave(feedbackId: string, content: string) {
    setEditLoading(true);
    setEditError(null);
    try {
      const res = await fetch(`/api/v1/feedback/${feedbackId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error('Failed to update feedback');
      setEditingId(null);
      refetchFeedback();
    } catch (err: any) {
      setEditError(err.message || 'Failed to update feedback');
    } finally {
      setEditLoading(false);
    }
  }

  return (
    <Box className="feedback-list" p={4} bg="white" rounded="md" shadow="md" maxW="md" mx="auto">
      {feedbackList.map((fb: any, idx: number) => {
        const isEditing = editingId === fb.id;
        return (
          <Box key={fb.id ?? idx} mb={3} p={3} bg={fb.optimistic ? 'gray.100' : 'gray.50'} rounded="md" shadow="sm">
            <Text fontWeight="bold">{fb.polish ? 'Polished' : 'Feedback'}:</Text>
            <Text fontSize="sm" color="gray.600">Author: {fb.authorName}</Text>
            <Text fontSize="sm" color="gray.600">Receiver: {fb.targetUserName}</Text>
            {isEditing ? (
              <>
                <Textarea value={editText} onChange={e => setEditText(e.target.value)} isDisabled={editLoading} mb={2} />
                <select
                  value={editModels[fb.id] || 'default'}
                  onChange={e => setEditModels(models => ({ ...models, [fb.id]: e.target.value }))}
                  disabled={editLoading}
                  style={{ marginBottom: '8px', width: '100%' }}
                >
                  <option value="default">No model (raw)</option>
                  <option value="hf-model">Polish with HuggingFace</option>
                </select>
                <Button size="sm" colorScheme="blue" onClick={() => handleEditSave(fb.id, editText)} isLoading={editLoading} mr={2}>Save</Button>
                <Button size="sm" variant="ghost" onClick={() => { setEditingId(null); refetchFeedback(); }} isDisabled={editLoading}>Cancel</Button>
                {editError && <Text color="red.500" mt={2}>{editError}</Text>}
              </>
            ) : (
              <Text>{fb.polishContent || fb.content}</Text>
            )}
            {canEditFeedback(fb) && !isEditing && (
              <Button size="xs" mt={2} onClick={() => { setEditingId(fb.id); setEditText(fb.content); setEditModels(models => ({ ...models, [fb.id]: fb.model || 'default' })); }}>Edit</Button>
            )}
          </Box>
        );
      })}
    </Box>
  );
};
