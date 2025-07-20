import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Tabs, Tab, Button, ButtonGroup } from 'react-bootstrap';
import Dashboard from '../components/Dashboard';
import MilkVolumeChart from '../components/charts/MilkVolumeChart';
import SpoilageTrendChart from '../components/charts/SpoilageTrendChart';
import api from '../services/api';
import './css/HomePage.css';

const HomePage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get(`/dashboard/stats?range=${timeRange}`);
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [timeRange]);

  return (
    <Container fluid className="home-page">
      <Row>
        <Col>
          <h1 className="page-title">MilkFlow Rwanda Dashboard</h1>
          
          <div className="time-range-selector mb-4">
            <ButtonGroup>
              <Button 
                variant={timeRange === 'day' ? 'primary' : 'outline-primary'}
                onClick={() => setTimeRange('day')}
              >
                Today
              </Button>
              <Button 
                variant={timeRange === 'week' ? 'primary' : 'outline-primary'}
                onClick={() => setTimeRange('week')}
              >
                This Week
              </Button>
              <Button 
                variant={timeRange === 'month' ? 'primary' : 'outline-primary'}
                onClick={() => setTimeRange('month')}
              >
                This Month
              </Button>
            </ButtonGroup>
          </div>

          <Dashboard stats={stats} loading={loading} />
          
          <Tabs defaultActiveKey="volume" className="chart-tabs">
            <Tab eventKey="volume" title="Milk Volume">
              <MilkVolumeChart data={stats?.volumeData || []} />
            </Tab>
            <Tab eventKey="spoilage" title="Spoilage Trend">
              <SpoilageTrendChart data={stats?.spoilageData || []} />
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </Container>
  );
};

export default HomePage;