import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Spinner } from 'react-bootstrap';
import api from '../services/api';

const CollectionTracking = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await api.get('/collections');
        setCollections(response.data);
      } catch (error) {
        console.error('Error fetching collections:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

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

  return (
    <div className="collection-tracking">
      <div className="d-flex justify-content-between mb-4">
        <h2>Milk Collections</h2>
        <Button variant="primary">New Collection</Button>
      </div>
      
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Center</th>
            <th>Planned Date</th>
            <th>Batches</th>
            <th>Total Milk (L)</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {collections.map(collection => (
            <tr key={collection._id}>
              <td>{collection.collectionId}</td>
              <td>{collection.center?.name}</td>
              <td>{new Date(collection.plannedDate).toLocaleString()}</td>
              <td>{collection.batches?.length || 0}</td>
              <td>
                {collection.batches?.reduce((sum, batch) => sum + batch.quantity, 0)}
              </td>
              <td>{getStatusBadge(collection.status)}</td>
              <td>
                <Button variant="info" size="sm" className="mr-2">View</Button>
                <Button variant="secondary" size="sm">Edit</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default CollectionTracking;