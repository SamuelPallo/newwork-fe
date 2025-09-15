
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tokenService } from '../services/tokenService';
import { hfIntegration } from '../services/hfIntegration';

async function fetchFeedback(userId: string) {
  const token = tokenService.getToken();
  const res = await fetch(`/api/v1/users/${userId}/feedback`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw await res.json().catch(() => ({ message: 'Failed to fetch feedback' }));
  return res.json();
}

async function postFeedback(userId: string, content: string, polish: boolean, model?: string) {
  const token = tokenService.getToken();
  let polished_content = content;
  if (polish && model) {
    polished_content = await hfIntegration.polishFeedback(content, model);
  }
  const res = await fetch(`/api/v1/users/${userId}/feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content, polish, polished_content }),
  });
  if (!res.ok) throw await res.json().catch(() => ({ message: 'Failed to add feedback' }));
  return res.json();
}

export const useFeedback = (userId: string) => {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery(['feedback', userId], () => fetchFeedback(userId), {
    enabled: !!userId,
  });

  const addFeedbackMutation = useMutation({
    mutationFn: async ({ content, polish, model }: { content: string; polish: boolean; model?: string }) =>
      postFeedback(userId, content, polish, model),
    onMutate: async (newFeedback) => {
      await queryClient.cancelQueries(['feedback', userId]);
      const previous = queryClient.getQueryData(['feedback', userId]);
      queryClient.setQueryData(['feedback', userId], (old: any = []) => [
        { ...newFeedback, optimistic: true },
        ...(old || []),
      ]);
      return { previous };
    },
    onError: (_err, _newFeedback, context) => {
      queryClient.setQueryData(['feedback', userId], context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['feedback', userId]);
    },
  });

  return {
    feedbackList: data || [],
    addFeedback: addFeedbackMutation.mutate,
    adding: addFeedbackMutation.isLoading,
    loading: isLoading,
    error,
  };
};
