import { useState } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const LoginForm = () => {
    const navigate= useNavigate()
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState(null);
  const { login, loading, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    
    if (!email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }

    try {
      await login(email, password);
      navigate('/')
    } catch (err) {
      setLocalError(err.message || 'Login failed');
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <h2 className="mb-4">Login</h2>
      
      {(error || localError) && (
        <Alert variant="danger">{error || localError}</Alert>
      )}
      
      <Form.Group className="mb-3">
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
      </Form.Group>
      
      <Form.Group className="mb-3">
        <Form.Label>Password</Form.Label>
        <Form.Control
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
      </Form.Group>
     
      <Button type="submit" disabled={loading}>
        {loading ? (
          <>
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
            />
            <span className="ms-2">Loading...</span>
          </>
        ) : (
          'Login'
        )}
      </Button>
    </Form>
  );
};

export default LoginForm;