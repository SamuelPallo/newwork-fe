
import React, { useState } from 'react';
import { Box, Textarea, Button, Select, Spinner, useToast } from '@chakra-ui/react';
import { useAuth } from '../hooks/useAuth';
import { useAddFeedback } from '../hooks/useAddFeedback';


export const FeedbackComposer: React.FC = () => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [polish, setPolish] = useState(false);
  const [model, setModel] = useState('default');
  const toast = useToast();
  const { mutate: addFeedback, status } = useAddFeedback(user?.sub);
  const adding = status === 'loading';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addFeedback(
      { content, polish, model },
      {
        onSuccess: () => {
          toast({ title: 'Feedback added', status: 'success', duration: 1500 });
          setContent('');
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
      <form onSubmit={handleSubmit}>
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
          isLoading={adding && polish}
          onClick={() => setPolish(model !== 'default')}
          w="full"
        >
          {polish ? 'Polish & Submit' : 'Submit'}
        </Button>
        {adding && polish && <Spinner mt={2} />}
      </form>
    </Box>
  );
};
