
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// import { tokenService } from '../services/tokenService';
import { hfIntegration } from '../services/hfIntegration';



export const useFeedback = (userId: string | undefined, token?: string) => {
  const queryClient = useQueryClient();
  const fetchFeedbackWithToken = async () => {
    if (!token) throw new Error('No token');
    if (!userId) throw new Error('No userId');
    const res = await fetch(`/api/v1/feedback/users/${userId}/feedback`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw await res.json().catch(() => ({ message: 'Failed to fetch feedback' }));
    return res.json();
  };
  const postFeedbackWithToken = async ({ content, polish, model }: { content: string; polish: boolean; model?: string }) => {
    if (!token) throw new Error('No token');
    if (!userId) throw new Error('No userId');
    let polished_content = content;
    if (polish && model) {
      polished_content = await hfIntegration.polishFeedback(content, model);
    }
    const res = await fetch(`/api/v1/feedback/users/${userId}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content, polish, polished_content }),
    });
    if (!res.ok) throw await res.json().catch(() => ({ message: 'Failed to add feedback' }));
    return res.json();
  };
  const { data, isLoading, error } = useQuery(['feedback', userId, token], fetchFeedbackWithToken, {
    enabled: !!userId && !!token,
  });
  const addFeedbackMutation = useMutation({
    mutationFn: postFeedbackWithToken,
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
