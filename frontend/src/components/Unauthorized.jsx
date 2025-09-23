import { Alert } from 'react-bootstrap';

const Unauthorized = () => {
  return (
    <Alert variant="danger">
      <Alert.Heading>Ntimwemerewe Kwinjira</Alert.Heading>
      <p>Nta ruhushya Rwo kureba aya makuru.</p>
    </Alert>
  );
};

export default Unauthorized;