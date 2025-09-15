
import React from 'react';
import { Box, Text, Spinner, Alert, AlertIcon } from '@chakra-ui/react';
import { useAuth } from '../hooks/useAuth';
import { useFeedback } from '../hooks/useFeedback';

export const FeedbackList: React.FC = () => {
  const { user } = useAuth();
  const { feedbackList, loading, error } = useFeedback(user?.sub);

  if (loading) return <Spinner size="lg" />;
  if (error) {
    let message = 'Failed to load feedback';
    const err = error as any;
    if (err?.message) message = err.message;
    if (err?.detail) message = err.detail;
    return <Alert status="error"><AlertIcon />{message}</Alert>;
  }
  if (!feedbackList.length) return <Text>No feedback yet.</Text>;

  return (
    <Box className="feedback-list" p={4} bg="white" rounded="md" shadow="md" maxW="md" mx="auto">
      {feedbackList.map((fb: any, idx: number) => (
        <Box key={idx} mb={3} p={3} bg={fb.optimistic ? 'gray.100' : 'gray.50'} rounded="md" shadow="sm">
          <Text fontWeight="bold">{fb.polish ? 'Polished' : 'Raw'}:</Text>
          <Text>{fb.polished_content || fb.content}</Text>
          {/* Add visibility/role logic here if needed */}
        </Box>
      ))}
    </Box>
  );
};
