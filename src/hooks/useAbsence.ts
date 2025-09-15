import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAbsenceRequests, createAbsenceRequest, approveAbsenceRequest, rejectAbsenceRequest } from '../api/absenceApi';

export const useAbsence = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['absences'],
    queryFn: getAbsenceRequests,
  });

  const createMutation = useMutation({
    mutationFn: createAbsenceRequest,
    onSuccess: () => {
      queryClient.invalidateQueries(['absences']);
    },
  });

  const approveMutation = useMutation({
    mutationFn: approveAbsenceRequest,
    onSuccess: () => {
      queryClient.invalidateQueries(['absences']);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: rejectAbsenceRequest,
    onSuccess: () => {
      queryClient.invalidateQueries(['absences']);
    },
  });

  return {
    absences: data || [],
    loading: isLoading,
    error,
    createAbsence: createMutation.mutate,
    approving: approveMutation.isLoading,
    approveAbsence: approveMutation.mutate,
    rejecting: rejectMutation.isLoading,
    rejectAbsence: rejectMutation.mutate,
  };
};
