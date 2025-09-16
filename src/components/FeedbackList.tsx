
import React from 'react';
import { Box, Text, Spinner, Alert, AlertIcon, Button, Textarea } from '@chakra-ui/react';
import { useAuth } from '../hooks/useAuth';
import { useFeedback } from '../hooks/useFeedback';

export const FeedbackList: React.FC = () => {
  const { userId, token, user, activeRole } = useAuth();
  const safeUserId: string | undefined = userId !== null && typeof userId === 'string' ? userId : undefined;
  const { feedbackList, loading, error } = useFeedback(safeUserId, token ?? undefined);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editText, setEditText] = React.useState<string>('');
  const [editLoading, setEditLoading] = React.useState(false);
  const [editError, setEditError] = React.useState<string | null>(null);

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
    return activeRole === 'ROLE_EMPLOYEE' && fb.authorId === userId;
  }

  async function handleEditSave(feedbackId: string) {
    setEditLoading(true);
    setEditError(null);
    try {
      const res = await fetch(`/api/v1/feedback/${feedbackId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: editText }),
      });
      if (!res.ok) throw new Error('Failed to update feedback');
      setEditingId(null);
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
            <Text fontWeight="bold">{fb.polish ? 'Polished' : 'Raw'}:</Text>
            {isEditing ? (
              <>
                <Textarea value={editText} onChange={e => setEditText(e.target.value)} isDisabled={editLoading} mb={2} />
                <Button size="sm" colorScheme="blue" onClick={() => handleEditSave(fb.id)} isLoading={editLoading} mr={2}>Save</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} isDisabled={editLoading}>Cancel</Button>
                {editError && <Text color="red.500" mt={2}>{editError}</Text>}
              </>
            ) : (
              <Text>{fb.polished_content || fb.content}</Text>
            )}
            {canEditFeedback(fb) && !isEditing && (
              <Button size="xs" mt={2} onClick={() => { setEditingId(fb.id); setEditText(fb.content); }}>Edit</Button>
            )}
          </Box>
        );
      })}
    </Box>
  );
};
