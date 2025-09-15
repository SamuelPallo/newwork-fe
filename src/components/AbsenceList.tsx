
import { useAbsence } from '../hooks/useAbsence';
import { Box, Spinner, Alert, AlertIcon, Table, Thead, Tbody, Tr, Th, Td, Badge } from '@chakra-ui/react';

export const AbsenceList: React.FC = () => {
  const { absences, loading, error } = useAbsence();

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
      <Table variant="simple" aria-label="Absence Requests" size="sm">
        <Thead>
          <Tr>
            <Th>Type</Th>
            <Th>Start Date</Th>
            <Th>End Date</Th>
            <Th>Status</Th>
            <Th>Reason</Th>
          </Tr>
        </Thead>
        <Tbody>
          {absences.map((absence: any) => (
            <Tr key={absence.id} tabIndex={0} aria-label={`Absence ${absence.type} from ${absence.startDate} to ${absence.endDate}`}> 
              <Td>{absence.type}</Td>
              <Td>{absence.startDate}</Td>
              <Td>{absence.endDate}</Td>
              <Td>
                <Badge colorScheme={absence.status === 'approved' ? 'green' : absence.status === 'pending' ? 'yellow' : 'red'} aria-label={absence.status}>
                  {absence.status}
                </Badge>
              </Td>
              <Td>{absence.reason}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};
