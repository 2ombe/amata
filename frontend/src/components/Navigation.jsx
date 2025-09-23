import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
  const { isAuthenticated, logout } = useAuth();
  
  return (
    <Navbar bg="primary" variant="dark" expand="lg">
      <Container>
        <LinkContainer to="/">
          <Navbar.Brand>Amata</Navbar.Brand>
        </LinkContainer>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ml-auto">
            {isAuthenticated ? (
              <>
                <LinkContainer to="/collections">
                  <Nav.Link>Umusaruro</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/farmers">
                  <Nav.Link>Aborozi</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/centers">
                  <Nav.Link>Amakusanyirizo</Nav.Link>
                </LinkContainer>
                <Nav.Link onClick={logout}>Sohoka</Nav.Link>
              </>
            ) : (
              <LinkContainer to="/login">
                <Nav.Link>Injira</Nav.Link>
              </LinkContainer>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;