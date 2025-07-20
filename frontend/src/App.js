import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import CollectionsPage from './pages/CollectionsPage';
import FarmersPage from './pages/FarmersPage';
import CentersPage from './pages/CentersPage';
import CollectionDetailPage from './pages/CollectionDetailPage';
import './App.css';

function App() {
  return (
    <Router>
      <Navigation />
      <Container fluid="md" className="py-4">
        <Routes>
          <Route exact path="/" element={<HomePage/>} />
          <Route exact path="/collections" element={<CollectionsPage/>} />
          <Route path="/collections/:id" element={<CollectionDetailPage/>} />
          <Route path="/farmers" element={<FarmersPage/>} />
          <Route path="/centers" element={<CentersPage/>} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;