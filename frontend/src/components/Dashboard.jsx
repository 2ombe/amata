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
      <h2 className="mb-4">Amakuru Rusange</h2>
      <Row>
        <Col md={3}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Aborozi Bose</Card.Title>
              <Card.Text className="display-4">
                {stats?.farmers || 0}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Umusaruro Wumunsi</Card.Title>
              <Card.Text className="display-4">
                {stats?.collections || 0}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Amata yakusanyijwe (L)</Card.Title>
              <Card.Text className="display-4">
                {stats?.milkVolume || 0}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Umusaruro Wangirika</Card.Title>
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