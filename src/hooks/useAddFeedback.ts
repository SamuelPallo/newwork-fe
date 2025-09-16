import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tokenService } from '../services/tokenService';
import { hfIntegration } from '../services/hfIntegration';

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

export const useAddFeedback = (userId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ content, polish, model }: { content: string; polish: boolean; model?: string }) =>
      postFeedback(userId, content, polish, model),
    onSuccess: () => {
      // Optionally invalidate feedback list queries if needed
      queryClient.invalidateQueries(['feedback', userId]);
    },
  });
};
