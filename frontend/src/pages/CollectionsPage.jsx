import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Button, Modal, Form, 
  InputGroup, FormControl, Pagination, Spinner,
  Alert, FloatingLabel
} from 'react-bootstrap';
import { Search, Filter } from 'react-bootstrap-icons';
import CollectionTracking from '../components/CollectionTracking';
import api from '../services/api';
import './css/CollectionsPage.css';

const CollectionsPage = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    center: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0
  });
  const [farmers, setFarmers] = useState([]);
  const [formData, setFormData] = useState({
    farmer: '',
    quantity: '',
    qualityMetrics: {
      fatContent: '',
      acidity: '',
      temperatureAtCollection: '',
      lactometerReading: '',
      adulterationTest: false
    },
    pricePerLiter: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setLoading(true);
        const params = {
          page: pagination.currentPage,
          limit: pagination.itemsPerPage,
          search: searchTerm,
          ...filters
        };
        
        const response = await api.get('/collections', { 
          params,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        setCollections(Array.isArray(response.data) ? response.data : []);
        setPagination(prev => ({
          ...prev,
          totalItems: response.headers['x-total-count'] || response.data.length || 0
        }));
      } catch (error) {
        console.error('Error fetching collections:', error);
        setCollections([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchFarmers = async () => {
      try {
        const response = await api.get('/farmers', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setFarmers(response.data);
      } catch (error) {
        console.error('Error fetching farmers:', error);
      }
    };

    fetchCollections();
    fetchFarmers();
  }, [pagination.currentPage, searchTerm, filters]);

 const handleSubmit = async (e) => {
  e.preventDefault();
  console.log("Submit button clicked"); // Debug log
  
  const isValid = validateForm();
  console.log("Form validation result:", isValid); // Debug log
  if (!isValid) {
    console.log("Form validation errors:", formErrors); // Debug log
    return;
  }

  console.log("Preparing to submit form"); // Debug log
  setSubmitLoading(true);
  setSubmitError('');

  try {
    const payload = {
      farmerId: formData.farmer,
      quantity: parseFloat(formData.quantity),
      pricePerLiter: parseFloat(formData.pricePerLiter),
      qualityMetrics: {
        fatContent: formData.qualityMetrics.fatContent ? parseFloat(formData.qualityMetrics.fatContent) : undefined,
        acidity: formData.qualityMetrics.acidity ? parseFloat(formData.qualityMetrics.acidity) : undefined,
        temperatureAtCollection: formData.qualityMetrics.temperatureAtCollection ? 
          parseFloat(formData.qualityMetrics.temperatureAtCollection) : undefined,
        lactometerReading: formData.qualityMetrics.lactometerReading ? 
          parseFloat(formData.qualityMetrics.lactometerReading) : undefined,
        adulterationTest: formData.qualityMetrics.adulterationTest
      }
    };
    console.log("Payload to be sent:", payload); // Debug log

    const response = await api.post('/collections', payload, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    console.log("API response:", response); // Debug log

    setCollections(prev => [response.data, ...prev]);
    setShowModal(false);
    resetForm();
  } catch (error) {
    console.error('Error creating collection:', error);
    setSubmitError(error.response?.data?.message || 'Failed to create collection');
  } finally {
    setSubmitLoading(false);
  }
};

  const resetForm = () => {
    setFormData({
      farmer: '',
      quantity: '',
      qualityMetrics: {
        fatContent: '',
        acidity: '',
        temperatureAtCollection: '',
        lactometerReading: '',
        adulterationTest: false
      },
      pricePerLiter: ''
    });
    setFormErrors({});
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('qualityMetrics.')) {
      const metricName = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        qualityMetrics: {
          ...prev.qualityMetrics,
          [metricName]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      qualityMetrics: {
        ...prev.qualityMetrics,
        [name]: checked
      }
    }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.farmer) errors.farmer = 'Farmer is required';
    if (!formData.pricePerLiter || isNaN(formData.pricePerLiter)) errors.pricePerLiter = 'Valid price is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  

  return (
    <Container fluid className="collections-page">
      <Row>
        <Col>
          <div className="page-header">
            <h1>Milk Collections</h1>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              New Collection
            </Button>
          </div>

          <div className="search-filter-container mb-4">
            <InputGroup className="search-box">
              <InputGroup.Text>
                <Search />
              </InputGroup.Text>
              <FormControl
                placeholder="Search collections..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </InputGroup>

            <div className="filters">
              <Form.Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </Form.Select>

              <Form.Select
                value={filters.center}
                onChange={(e) => handleFilterChange('center', e.target.value)}
              >
                <option value="">All Centers</option>
                {collections.map(center => (
                  <option key={center._id} value={center._id}>
                    {center.name}
                  </option>
                ))}
              </Form.Select>
            </div>
          </div>

          {loading ? (
            <div className="loading-spinner">
              <Spinner animation="border" />
            </div>
          ) : (
           <>
  {loading ? (
    <div className="loading-spinner">
      <Spinner animation="border" />
    </div>
  ) : collections.length > 0 ? (
    <>
      <CollectionTracking collections={collections} />
      {pagination.totalItems > 0 && (
        <div className="pagination-container">
          <Pagination>
            <Pagination.First 
              onClick={() => handlePageChange(1)} 
              disabled={pagination.currentPage === 1} 
            />
            <Pagination.Prev 
              onClick={() => handlePageChange(pagination.currentPage - 1)} 
              disabled={pagination.currentPage === 1} 
            />
            
            {[...Array(Math.ceil(pagination.totalItems / pagination.itemsPerPage))].map((_, i) => (
              <Pagination.Item
                key={i + 1}
                active={i + 1 === pagination.currentPage}
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </Pagination.Item>
            ))}
            
            <Pagination.Next 
              onClick={() => handlePageChange(pagination.currentPage + 1)} 
              disabled={pagination.currentPage * pagination.itemsPerPage >= pagination.totalItems} 
            />
            <Pagination.Last 
              onClick={() => handlePageChange(Math.ceil(pagination.totalItems / pagination.itemsPerPage))} 
              disabled={pagination.currentPage * pagination.itemsPerPage >= pagination.totalItems} 
            />
          </Pagination>
          
          <div className="page-info">
            Showing {(pagination.currentPage - 1) * pagination.itemsPerPage + 1} to{' '}
            {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
            {pagination.totalItems} collections
          </div>
        </div>
      )}
    </>
  ) : (
    <Alert variant="info" className="mt-3">
      No collections found. Create your first collection by clicking "New Collection".
    </Alert>
  )}
</>
          )}

          {/* New Collection Modal */}
          <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
            <Modal.Header closeButton>
              <Modal.Title>New Milk Collection</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {submitError && <Alert variant="danger">{submitError}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Row className="mb-3">
              <Col md={6}>
                <FloatingLabel controlId="farmer" label="Farmer" className="mb-3">
                  <Form.Select
                    name="farmer"
                    value={formData.farmer}
                    onChange={handleInputChange}
                    isInvalid={!!formErrors.farmer}
                    required
                  >
                    <option value="">Select Farmer</option>
                    {farmers.map(farmer => (
                      <option key={farmer._id} value={farmer._id}>
                        {farmer.name} ({farmer.farmerId})
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {formErrors.farmer}
                  </Form.Control.Feedback>
                </FloatingLabel>
              </Col>
            </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <FloatingLabel controlId="quantity" label="Quantity (liters)">
                      <Form.Control
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        step="0.1"
                        min="0"
                        isInvalid={!!formErrors.quantity}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formErrors.quantity}
                      </Form.Control.Feedback>
                    </FloatingLabel>
                  </Col>
                  <Col md={6}>
                    <FloatingLabel controlId="pricePerLiter" label="Price per liter">
                      <Form.Control
                        type="number"
                        name="pricePerLiter"
                        value={formData.pricePerLiter}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        isInvalid={!!formErrors.pricePerLiter}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formErrors.pricePerLiter}
                      </Form.Control.Feedback>
                    </FloatingLabel>
                  </Col>
                </Row>

                <h5 className="mt-4 mb-3">Quality Metrics</h5>
                <Row className="mb-3">
                  <Col md={4}>
                    <FloatingLabel controlId="fatContent" label="Fat Content (%)">
                      <Form.Control
                        type="number"
                        name="qualityMetrics.fatContent"
                        value={formData.qualityMetrics.fatContent}
                        onChange={handleInputChange}
                        step="0.1"
                        min="0"
                        max="100"
                      />
                    </FloatingLabel>
                  </Col>
                  <Col md={4}>
                    <FloatingLabel controlId="acidity" label="Acidity (pH)">
                      <Form.Control
                        type="number"
                        name="qualityMetrics.acidity"
                        value={formData.qualityMetrics.acidity}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        max="1"
                      />
                    </FloatingLabel>
                  </Col>
                  <Col md={4}>
                    <FloatingLabel controlId="temperatureAtCollection" label="Temperature (°C)">
                      <Form.Control
                        type="number"
                        name="qualityMetrics.temperatureAtCollection"
                        value={formData.qualityMetrics.temperatureAtCollection}
                        onChange={handleInputChange}
                        step="0.1"
                      />
                    </FloatingLabel>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <FloatingLabel controlId="lactometerReading" label="Lactometer Reading">
                      <Form.Control
                        type="number"
                        name="qualityMetrics.lactometerReading"
                        value={formData.qualityMetrics.lactometerReading}
                        onChange={handleInputChange}
                        step="0.1"
                        min="0"
                      />
                    </FloatingLabel>
                  </Col>
                  <Col md={6} className="d-flex align-items-center">
                    <Form.Check
                      type="checkbox"
                      id="adulterationTest"
                      name="adulterationTest"
                      label="Adulteration Test Passed"
                      checked={formData.qualityMetrics.adulterationTest}
                      onChange={handleCheckboxChange}
                    />
                  </Col>
                </Row>

                <div className="d-flex justify-content-end mt-4">
                  <Button 
                variant="secondary" 
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }} 
                className="me-2"
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={submitLoading}
              >
                {submitLoading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                    <span className="ms-2">Saving...</span>
                  </>
                ) : 'Save Collection'}
              </Button>
                </div>
              </Form>
            </Modal.Body>
          </Modal>
        </Col>
      </Row>
    </Container>
  );
};

export default CollectionsPage;