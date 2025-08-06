import { Alert } from 'react-bootstrap';

const Unauthorized = () => {
  return (
    <Alert variant="danger">
      <Alert.Heading>Unauthorized Access</Alert.Heading>
      <p>You don't have permission to view this page.</p>
    </Alert>
  );
};

export default Unauthorized;