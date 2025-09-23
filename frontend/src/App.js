import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { div } from 'react-bootstrap';
import { AuthProvider } from './context/AuthContext';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import CollectionsPage from './pages/CollectionsPage';
import FarmersPage from './pages/FarmersPage';
import CentersPage from './pages/CentersPage';
import CollectionDetailPage from './pages/CollectionDetailPage';
import LoginForm from './pages/LoginForm';
import RegisterForm from './pages/RegisterForm';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';
import Unauthorized from './components/Unauthorized';
import WelcomePage from './pages/WelcomePage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navigation />
        <div fluid="md" className="py-4">
          <Routes>
              <Route path="/" element={<WelcomePage/>} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/dasbboard" element={<HomePage />} />
              <Route path="/collections" element={<CollectionsPage />} />
              <Route path="/collections/:id" element={<CollectionDetailPage />} />
              <Route path="/farmers" element={<FarmersPage />} />
              <Route path="/centers" element={<CentersPage />} />
            </Route>

            {/* Admin-only route */}
            <Route element={<ProtectedRoute roles={['isAdmin']} />}>
              <Route path="/register" element={<RegisterForm />} />
            </Route>
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;