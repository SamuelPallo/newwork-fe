import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAbsenceRequests, getUserAbsenceRequests, createAbsenceRequest, approveAbsenceRequest, rejectAbsenceRequest } from '../api/absenceApi';

export const useAbsence = (userId: string) => {
  const queryClient = useQueryClient();

  const { data, status, error } = useQuery({
    queryKey: ['absences', userId],
    queryFn: () => getUserAbsenceRequests(userId),
    enabled: !!userId,
  });

  const createMutation = useMutation({
    mutationFn: createAbsenceRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['absences', userId] });
    },
  });

  const approveMutation = useMutation({
    mutationFn: approveAbsenceRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['absences', userId] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: rejectAbsenceRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['absences', userId] });
    },
  });

  return {
    absences: data || [],
    loading: status === 'loading',
    error,
    createAbsence: createMutation.mutate,
    approving: approveMutation.status === 'loading',
    approveAbsence: approveMutation.mutate,
    rejecting: rejectMutation.status === 'loading',
    rejectAbsence: rejectMutation.mutate,
  };
};
