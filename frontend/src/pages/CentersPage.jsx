import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Spinner, Alert, 
  Button, Modal, Form, Tab, Tabs, 
  Badge
} from 'react-bootstrap';
import { GeoAlt, Plus } from 'react-bootstrap-icons';
import api from '../services/api';
import MapView from '../components/MapView';
import './css/CentersPage.css';

const CentersPage = () => {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('cards');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCenter, setNewCenter] = useState({
    name: '',
    village: '',
    contactPerson: '',
    contactPhone: '',
    storageCapacity: '',
    centerEmail:'',
    hasCooler: false
  });

  useEffect(() => {
    const fetchCenters = async () => {
      try {
        const response = await api.get('/centers');
        setCenters(response.data);
      } catch (err) {
        setError('Failed to load collection centers data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCenters();
  }, []);

  const handleAddCenter = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/centers', newCenter);
      setCenters(prev => [...prev, response.data]);
      setShowAddModal(false);
      setNewCenter({
        name: '',
        village: '',
        contactPerson: '',
        centerEmail:'',
        contactPhone: '',
        storageCapacity: '',
        hasCooler: false
      });
    } catch (err) {
      console.error('Error adding center:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewCenter(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <Container fluid className="centers-page">
      <div className="page-header">
        <h1>Amakusanyirizo</h1>
        <Button 
          variant="primary" 
          onClick={() => setShowAddModal(true)}
          className="add-button"
        >
          <Plus className="icon" /> Ongeraho Ikusanyirizo
        </Button>
      </div>

      {/* {error && <Alert variant="danger">{error}</Alert>} */}

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="view-tabs"
      >
        <Tab eventKey="cards" title="Card View">
          {loading ? (
            <div className="loading-spinner">
              <Spinner animation="border" />
            </div>
          ) : (
            
            <Row>
              {centers.map(center => (
                <Col key={center._id} md={6} lg={4} className="mb-4">
                  <Card className="center-card">
                    <Card.Header>
                      <div className="d-flex justify-content-between">
                        <h5>{center.name}</h5>
                        <Badge bg={center.status === 'active' ? 'success' : 'secondary'}>
                          {center.status}
                        </Badge>
                      </div>
                    </Card.Header>
                    <Card.Body>
                      <Card.Text>
                        <div className="detail-item">
                          <GeoAlt className="icon" />
                          <span>{center.location?.village}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">Telefone:</span>
                          {center.contactPerson} ({center.contactPhone})
                        </div>
                        <div className="detail-item">
                          <span className="label">Ubushobozi bwo kwakira:</span>
                          {center.storageCapacity}Litiro
                        </div>
                        <div className="detail-item">
                          <span className="label">Cooling:</span>
                          {center.coolingEquipment?.hasCooler ? 'Available' : 'Not Available'}
                        </div>
                      </Card.Text>
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        href={`/centers/${center._id}`}
                      >
                        Amakuru
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Tab>
        <Tab eventKey="map" title="Map View">
          <h1>Hello you</h1>
        </Tab>
      </Tabs>

      {/* Add Center Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Andika Ikusanyirizo rishya</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddCenter}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Izina Ryikusanyirizo</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={newCenter.name}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Aho Riherereye</Form.Label>
                  <Form.Control
                    type="text"
                    name="village"
                    value={newCenter.village}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Urishyizwe(Umuyobozi)</Form.Label>
                  <Form.Control
                    type="text"
                    name="contactPerson"
                    value={newCenter.contactPerson}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nimero ya Telephone</Form.Label>
                  <Form.Control
                    type="tel"
                    name="contactPhone"
                    value={newCenter.contactPhone}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ubushobozi (Mu malitiro)</Form.Label>
                  <Form.Control
                    type="number"
                    name="storageCapacity"
                    value={newCenter.storageCapacity}
                    onChange={handleInputChange}
                    min="500"
                    step="100"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Center Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="centerEmail"
                    value={newCenter.centerEmail}
                    onChange={handleInputChange}
                    
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Has Cooling Equipment"
                    name="hasCooler"
                    checked={newCenter.hasCooler}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Button variant="primary" type="submit">
              Emeza amakuru
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default CentersPage;