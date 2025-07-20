import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spinner } from 'react-bootstrap';
import api from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <Spinner animation="border" />;

  return (
    <div className="dashboard">
      <h2 className="mb-4">System Overview</h2>
      <Row>
        <Col md={3}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Total Farmers</Card.Title>
              <Card.Text className="display-4">
                {stats?.farmers || 0}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Today's Collections</Card.Title>
              <Card.Text className="display-4">
                {stats?.collections || 0}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Milk Collected (L)</Card.Title>
              <Card.Text className="display-4">
                {stats?.milkVolume || 0}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Spoilage Rate</Card.Title>
              <Card.Text className="display-4">
                {stats?.spoilageRate ? `${stats.spoilageRate}%` : '0%'}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;