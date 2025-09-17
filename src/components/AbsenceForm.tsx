import { useForm } from 'react-hook-form';
import { Button, FormControl, FormLabel, Input, Select, Textarea, useToast } from '@chakra-ui/react';
import { useMutation } from '@tanstack/react-query';
import { createAbsenceRequest } from '../api/absenceApi';

export type AbsenceFormValues = {
  startDate: string;
  endDate: string;
  type: string;
  reason: string;
};

const absenceTypes = [
  { value: 'vacation', label: 'Vacation' },
  { value: 'sick', label: 'Sick Leave' },
  { value: 'personal', label: 'Personal Leave' },
];

export const AbsenceForm: React.FC = () => {
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<AbsenceFormValues>();
  const toast = useToast();
  const mutation = useMutation({
    mutationFn: createAbsenceRequest,
    onSuccess: () => {
      toast({ title: 'Absence request submitted', status: 'success', duration: 3000 });
      reset();
    },
    onError: (error: any) => {
      let message = error?.message || error?.detail || 'Unknown error';
      toast({ title: 'Error submitting request', description: message, status: 'error', duration: 4000 });
    },
  });

  // Date logic
  const today = new Date().toISOString().split('T')[0];
  const startDate = watch('startDate') || today;

  const onSubmit = (data: AbsenceFormValues) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} aria-label="Absence Request Form" className="max-w-md mx-auto p-4 bg-white rounded shadow-md" tabIndex={0}>
      <FormControl isRequired mb={3}>
        <FormLabel htmlFor="type">Type</FormLabel>
        <Select id="type" {...register('type', { required: true })} aria-required="true" aria-label="Absence Type">
          <option value="">Select type</option>
          {absenceTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </Select>
      </FormControl>
      <FormControl isRequired mb={3}>
        <FormLabel htmlFor="startDate">Start Date</FormLabel>
        <Input
          id="startDate"
          type="date"
          min={today}
          {...register('startDate', { required: true })}
          aria-required="true"
          aria-label="Start Date"
        />
      </FormControl>
      <FormControl isRequired mb={3}>
        <FormLabel htmlFor="endDate">End Date</FormLabel>
        <Input
          id="endDate"
          type="date"
          min={startDate}
          {...register('endDate', { required: true })}
          aria-required="true"
          aria-label="End Date"
        />
      </FormControl>
      <FormControl mb={3}>
        <FormLabel htmlFor="reason">Reason</FormLabel>
        <Textarea id="reason" {...register('reason')} aria-label="Reason" />
      </FormControl>
      <Button type="submit" colorScheme="blue" isLoading={isSubmitting || mutation.isLoading} aria-label="Submit Absence Request" width="100%">
        Submit Request
      </Button>
    </form>
  );
};
