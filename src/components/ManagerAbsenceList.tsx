import React from 'react';
import { useAbsence } from '../hooks/useAbsence';
import { Box, Spinner, Alert, AlertIcon, Table, Thead, Tbody, Tr, Th, Td, Badge, Button, useToast, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@chakra-ui/react';
import { useAuth } from '../hooks/useAuth';

export const ManagerAbsenceList: React.FC = () => {
  const { absences, loading, error, approveAbsence, approving, rejectAbsence, rejecting } = useAbsence();
  const toast = useToast();
  const { isManager } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [pendingAction, setPendingAction] = React.useState<{ type: 'approve' | 'reject'; id: string | null }>({ type: 'approve', id: null });

  const handleAction = (type: 'approve' | 'reject', id: string) => {
    setPendingAction({ type, id });
    onOpen();
  };

  const handleConfirm = () => {
    if (pendingAction.type === 'approve' && pendingAction.id) {
      approveAbsence(pendingAction.id, {
        onSuccess: () => {
          toast({ title: 'Absence approved', status: 'success', duration: 3000 });
          onClose();
        },
        onError: (error: any) => {
          let message = error?.message || error?.detail || 'Unknown error';
          toast({ title: 'Error approving', description: message, status: 'error', duration: 4000 });
        },
      });
    } else if (pendingAction.type === 'reject' && pendingAction.id) {
      rejectAbsence(pendingAction.id, {
        onSuccess: () => {
          toast({ title: 'Absence rejected', status: 'success', duration: 3000 });
          onClose();
        },
        onError: (error: any) => {
          let message = error?.message || error?.detail || 'Unknown error';
          toast({ title: 'Error rejecting', description: message, status: 'error', duration: 4000 });
        },
      });
    }
  };

  if (loading) return <Spinner label="Loading absences..." />;
  if (error) {
    let message = 'Failed to load absences';
    const err = error as any;
    if (err?.message) message = err.message;
    if (err?.detail) message = err.detail;
    return <Alert status="error"><AlertIcon />{message}</Alert>;
  }

  if (!absences || absences.length === 0) {
    return <Box>No absence requests found.</Box>;
  }

  return (
    <Box overflowX="auto" className="w-full max-w-2xl mx-auto p-2">
      <Table variant="simple" aria-label="Manager Absence Requests" size="sm">
        <Thead>
          <Tr>
            <Th>User</Th>
            <Th>Type</Th>
            <Th>Start Date</Th>
            <Th>End Date</Th>
            <Th>Status</Th>
            <Th>Reason</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {absences.filter((a: any) => a.status === 'pending').map((absence: any) => (
            <Tr key={absence.id} tabIndex={0} aria-label={`Pending absence for ${absence.userName || absence.user?.name || 'User'}`}> 
              <Td>{absence.userName || absence.user?.name || 'User'}</Td>
              <Td>{absence.type}</Td>
              <Td>{absence.startDate}</Td>
              <Td>{absence.endDate}</Td>
              <Td>
                <Badge colorScheme="yellow" aria-label="Pending">Pending</Badge>
              </Td>
              <Td>{absence.reason}</Td>
              <Td>
                {isManager ? (
                  <>
                    <Button size="sm" colorScheme="green" mr={2} onClick={() => handleAction('approve', absence.id)} aria-label="Approve Absence" tabIndex={0} isLoading={approving}>Approve</Button>
                    <Button size="sm" colorScheme="red" onClick={() => handleAction('reject', absence.id)} aria-label="Reject Absence" tabIndex={0} isLoading={rejecting}>Reject</Button>
                  </>
                ) : (
                  <Badge colorScheme="gray" aria-label="No actions">No actions</Badge>
                )}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{pendingAction.type === 'approve' ? 'Approve Absence Request' : 'Reject Absence Request'}</ModalHeader>
          <ModalBody>
            Are you sure you want to {pendingAction.type} this absence request?
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose} mr={3} aria-label="Cancel">Cancel</Button>
            <Button colorScheme={pendingAction.type === 'approve' ? 'green' : 'red'} onClick={handleConfirm} isLoading={approving || rejecting} aria-label={`Confirm ${pendingAction.type}`}>{pendingAction.type === 'approve' ? 'Approve' : 'Reject'}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};
