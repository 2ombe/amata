import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Spinner } from 'react-bootstrap';
import api from '../services/api';

const CollectionTracking = ({ collections: propCollections, loading: propLoading }) => {
  const [internalCollections, setInternalCollections] = useState([]);
  const [internalLoading, setInternalLoading] = useState(true);
  
  // Use props if provided, otherwise use internal state
  const collections = propCollections || internalCollections;
  const loading = propLoading !== undefined ? propLoading : internalLoading;

  useEffect(() => {
    // Only fetch if no collections were passed as props
    if (!propCollections) {
      const fetchCollections = async () => {
        try {
          const response = await api.get('/collections',{ 
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
          setInternalCollections(response.data);
          console.log(response.data);
          
        } catch (error) {
          console.error('Error fetching collections:', error);
        } finally {
          setInternalLoading(false);
        }
      };
      fetchCollections();
    }
  }, [propCollections]);

  const getStatusBadge = (status) => {
    if (!status) return <Badge bg="secondary">Unknown</Badge>;
    
    const variants = {
      pending: 'warning',
      in_progress: 'primary',
      completed: 'success',
      cancelled: 'danger',
      collected: 'info',
      at_center: 'info',
      in_transit: 'primary',
      at_plant: 'primary',
      sold_fresh: 'success',
      processed: 'success',
      spoiled: 'danger'
    };
    
    const displayStatus = status.replace(/_/g, ' ');
    return <Badge bg={variants[status] || 'secondary'}>{displayStatus}</Badge>;
  };

  if (loading) return <Spinner animation="border" />;

  if (!collections || collections.length === 0) {
    return <div className="text-center py-4">No collections found</div>;
  }

  return (
    <div className="collection-tracking">
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Batch ID</th>
            <th>Farmer</th>
            <th>Collection Center</th>
            <th>Quantity (L)</th>
            <th>Collection Time</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {collections.map(collection => (
            <tr key={collection._id}>
              <td>{collection.batchId || collection._id}</td>
              <td>{collection.farmerId?.name || 'Unknown'}</td>
              <td>{collection.collectionCenter?.name || 'Unknown'}</td>
              <td>{collection.quantity}</td>
              <td>{new Date(collection.collectionTime).toLocaleString()}</td>
              <td>{getStatusBadge(collection.currentStatus || collection.status)}</td>
              <td>
                <Button variant="info" size="sm" className="me-2">View</Button>
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