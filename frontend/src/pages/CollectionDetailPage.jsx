import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Spinner, Alert, Badge, Button, Table } from 'react-bootstrap';
import api from '../services/api';

const CollectionDetailPage = () => {
  const { id } = useParams();
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const response = await api.get(`/collections/${id}`);
        setCollection(response.data);
      } catch (err) {
        setError('Failed to load collection details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCollection();
  }, [id]);

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      in_progress: 'primary',
      completed: 'success',
      cancelled: 'danger'
    };
    return <Badge variant={variants[status]}>{status.replace('_', ' ')}</Badge>;
  };

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!collection) return <Alert variant="info">Collection not found</Alert>;

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h1>Collection #{collection.collectionId}</h1>
          <div className="d-flex justify-content-between">
            <div>
              Status: {getStatusBadge(collection.status)}<br />
              Center: {collection.center?.name}
            </div>
            <div>
              <Button variant="secondary" className="mr-2">Edit</Button>
              <Button variant="info">Print Report</Button>
            </div>
          </div>
        </Col>
      </Row>
      
      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>Basic Information</Card.Header>
            <Card.Body>
              <p>
                <strong>Planned Date:</strong> {new Date(collection.plannedDate).toLocaleString()}<br />
                <strong>Actual Date:</strong> {collection.actualDate ? new Date(collection.actualDate).toLocaleString() : 'N/A'}<br />
                <strong>Vehicle:</strong> {collection.vehicle?.plateNumber || 'Not assigned'}
              </p>
              <p>
                <strong>Total Milk Collected:</strong> {collection.batches.reduce((sum, b) => sum + b.quantity, 0)}L<br />
                <strong>Number of Batches:</strong> {collection.batches.length}
              </p>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>Quality Metrics</Card.Header>
            <Card.Body>
              <p>
                <strong>Avg. Fat Content:</strong> {(
                  collection.batches.reduce((sum, b) => sum + b.quality.fatContent, 0) / collection.batches.length
                ).toFixed(2)}%<br />
                <strong>Avg. Temperature:</strong> {(
                  collection.batches.reduce((sum, b) => sum + b.quality.temperature, 0) / collection.batches.length
                ).toFixed(2)}°C
              </p>
              {collection.cooling?.violations?.length > 0 && (
                <Alert variant="warning">
                  <strong>Cooling Violations:</strong> {collection.cooling.violations.length}
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col>
          <h3>Batches</h3>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Farmer</th>
                <th>Quantity (L)</th>
                <th>Fat Content</th>
                <th>Temperature</th>
                <th>Collection Time</th>
              </tr>
            </thead>
            <tbody>
              {collection.batches.map((batch, index) => (
                <tr key={index}>
                  <td>{batch.farmer?.name || 'Unknown'}</td>
                  <td>{batch.quantity}</td>
                  <td>{batch.quality.fatContent}%</td>
                  <td>{batch.quality.temperature}°C</td>
                  <td>{new Date(batch.collectionTime).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
};

export default CollectionDetailPage;