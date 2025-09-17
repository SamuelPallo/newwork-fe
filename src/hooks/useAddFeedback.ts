
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tokenService } from '../services/tokenService';
import { useAuth } from './useAuth';
import { hfIntegration } from '../services/hfIntegration';

interface FeedbackPayload {
  content: string;
  model?: string;
  targetUserId: string;
}

function useAddFeedbackMutation() {
  const { userId, token } = useAuth();
  return async (payload: FeedbackPayload) => {
    if (!userId || !token) throw new Error('Missing auth user or token');
    let polished_content = payload.content;
    if (payload.model && payload.model !== 'default') {
      polished_content = await hfIntegration.polishFeedback(payload.content, payload.model);
    }
    const res = await fetch(`/api/v1/feedback/users/${userId}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        content: payload.content,
        model: payload.model,
        targetUserId: payload.targetUserId,
        polished_content,
      }),
    });
    if (!res.ok) throw await res.json().catch(() => ({ message: 'Failed to add feedback' }));
    return res.json();
  };
}

export const useAddFeedback = () => {
  const queryClient = useQueryClient();
  const mutationFn = useAddFeedbackMutation();
  return useMutation({
    mutationFn,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['feedback', variables.targetUserId] });
    },
  });
};
