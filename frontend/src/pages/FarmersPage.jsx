import React, { useState, useEffect, useContext } from 'react';
import { 
  Container, Table, Button, Spinner, Alert, 
  InputGroup, FormControl, Dropdown, Modal, Form, 
  Badge
} from 'react-bootstrap';
import { Search, ThreeDotsVertical, PersonPlus } from 'react-bootstrap-icons';
import api from '../services/api';
import './css/FarmersPage.css';
import { useAuth } from '../context/AuthContext';

const FarmersPage = () => {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFarmer, setNewFarmer] = useState({
    name: '',
    phone: '',
    village: '',
    paymentMethod: 'mobile_money'
  });
  const { user } = useAuth();

  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        const response = await api.get('/farmers', {
          params: { search: searchTerm },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setFarmers(response.data);
      } catch (err) {
        setError('Failed to load farmers data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFarmers();
  }, [searchTerm]);


  const handleAddFarmer = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/farmers', newFarmer, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'X-User-Id': user?._id,
          'X-User-Role': user?.role
        }
      });
      setFarmers(prev => [...prev, response.data]);
      setShowAddModal(false);
      setNewFarmer({
        name: '',
        phone: '',
        village: '',
        paymentMethod: 'mobile_money'
      });
    } catch (err) {
      console.error('Error adding farmer:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFarmer(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Container fluid className="farmers-page">
      <div className="page-header">
        <h1>Urupapuro Rwumworozi</h1>
        <div className="controls">
          <InputGroup className="search-box">
            <InputGroup.Text>
              <Search />
            </InputGroup.Text>
            <FormControl
              placeholder="Search farmers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
          <Button 
            variant="success" 
            onClick={() => setShowAddModal(true)}
            className="add-button"
          >
            <PersonPlus className="icon" /> Andika Umworozi Mushya
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="loading-spinner">
          <Spinner animation="border" />
        </div>
      ) : (
        <div className="table-responsive">
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Amazina</th>
                <th>Aho aturuka</th>
                <th>Telephone</th>
                <th>Umusaruro</th>
                <th>Uko yishyurwa</th>
                <th>Ibikurikira</th>
              </tr>
            </thead>
            <tbody>
              {farmers.map(farmer => (
                <tr key={farmer._id}>
                  <td>{farmer.farmerId}</td>
                  <td>{farmer.name}</td>
                  <td>{farmer.location?.village}</td>
                  <td>{farmer.contact?.phone}</td>
                  <td>{farmer.avgDailyProduction || 'N/A'} L/day</td>
                  <td>
                    <Badge bg="info">
                      {farmer.paymentDetails?.provider || 'N/A'}
                    </Badge>
                  </td>
                  <td className="actions-cell">
                    <Dropdown>
                      <Dropdown.Toggle variant="light" id="dropdown-actions">
                        <ThreeDotsVertical />
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item href={`/farmers/${farmer._id}`}>Reba Amakuru</Dropdown.Item>
                        <Dropdown.Item>Vugurura</Dropdown.Item>
                        <Dropdown.Item className="text-danger">Siba amakuru</Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* Add Farmer Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Andika umworozi mushya</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddFarmer}>
            <Form.Group className="mb-3">
              <Form.Label>Amazina yombi</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={newFarmer.name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Nimero yatelefone</Form.Label>
              <Form.Control
                type="tel"
                name="phone"
                value={newFarmer.phone}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Agace avamo</Form.Label>
              <Form.Control
                type="text"
                name="village"
                value={newFarmer.village}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Uburyo bwokwishyurwa</Form.Label>
              <Form.Select
                name="paymentMethod"
                value={newFarmer.paymentMethod}
                onChange={handleInputChange}
              >
                <option value="mobile_money">Mobile Money</option>
                <option value="cash">Muntoki</option>
                <option value="bank">Banki</option>
              </Form.Select>
            </Form.Group>

            <Button variant="primary" type="submit">
              Andika Umworozi
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default FarmersPage;