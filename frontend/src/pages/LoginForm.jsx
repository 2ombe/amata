import { useState } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState(null);
  const { login, loading, error } = useAuth();

  // In your LoginForm.js
const handleSubmit = async (e) => {
  e.preventDefault();
  setLocalError(null);
  
  if (!email || !password) {
    setLocalError('Please fill in all fields');
    return;
  }

  try {
    const success = await login(email, password);
    if (success) { 
      navigate('/', { replace: true }); 
    } else {
      setLocalError('Login failed. Please check your credentials.');
    }
  } catch (err) {
    setLocalError(err.message || 'An error occurred during login');
  }
};

  return (
    <div className="container mt-5" style={{ maxWidth: '500px' }}>
      <Form onSubmit={handleSubmit} className="p-4 border rounded shadow-sm bg-white">
        <h2 className="mb-4 text-center">Login</h2>
        
        {(error || localError) && (
          <Alert variant="danger" className="text-center">
            {error || localError}
          </Alert>
        )}
        
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            placeholder="Enter your email"
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
            placeholder="Enter your password"
          />
        </Form.Group>
       
        <div className="d-grid gap-2">
          <Button 
            type="submit" 
            disabled={loading}
            variant="primary"
            size="lg"
          >
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
        </div>

        <div className="mt-3 text-center">
          <p>
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </Form>
    </div>
  );
};

export default LoginForm;