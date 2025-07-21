import { useState } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'isFarmer'
  });
  
  const { register, loading, error } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await register(formData);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <h2 className="mb-4">Register</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Form.Group className="mb-3">
        <Form.Label>Name</Form.Label>
        <Form.Control
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </Form.Group>
      
      <Form.Group className="mb-3">
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </Form.Group>
      
      <Form.Group className="mb-3">
        <Form.Label>Password</Form.Label>
        <Form.Control
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </Form.Group>
      
      <Form.Group className="mb-3">
        <Form.Label>Phone</Form.Label>
        <Form.Control
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
        />
      </Form.Group>
      
      <Form.Group className="mb-3">
        <Form.Label>Role</Form.Label>
        <Form.Select name="role" value={formData.role} onChange={handleChange}>
          <option value="isFarmer">Farmer</option>
          <option value="isCollrctionCenter">Collection Center</option>
          <option value="isSupplier">Supplier</option>
          <option value="isProccessor">Processor</option>
        </Form.Select>
      </Form.Group>
      
      <Button type="submit" disabled={loading}>
        {loading ? <Spinner size="sm" /> : 'Register'}
      </Button>
    </Form>
  );
};

export default RegisterForm;