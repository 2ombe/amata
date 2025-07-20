import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Button, Modal, Form, 
  InputGroup, FormControl, Pagination, Spinner 
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

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const params = {
          page: pagination.currentPage,
          limit: pagination.itemsPerPage,
          search: searchTerm,
          ...filters
        };
        
        const response = await api.get('/collections', { params });
        setCollections(response.data.items);
        setPagination(prev => ({
          ...prev,
          totalItems: response.data.total
        }));
      } catch (error) {
        console.error('Error fetching collections:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, [pagination.currentPage, searchTerm, filters]);

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
                <option value="center1">Center 1</option>
                <option value="center2">Center 2</option>
              </Form.Select>
            </div>
          </div>

          {loading ? (
            <div className="loading-spinner">
              <Spinner animation="border" />
            </div>
          ) : (
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
          )}

          {/* New Collection Modal (same as before) */}
        </Col>
      </Row>
    </Container>
  );
};

export default CollectionsPage;