import { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import api from '../services/api';

const AuthContext = createContext();

const initialState = {
  user: null,
  loading: false,
  error: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_REQUEST':
    case 'REGISTER_REQUEST':
      return { ...state, loading: true };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      return { ...state, loading: false, user: action.payload };
    case 'LOGIN_FAIL':
    case 'REGISTER_FAIL':
    case 'LOGOUT':
      return { ...state, loading: false, user: null, error: action.payload };
    case 'LOAD_USER':
      return { ...state, user: action.payload, loading: false };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user from localStorage on initial render
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const res = await api.get('/users/profile', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          dispatch({ type: 'LOAD_USER', payload: res.data });
        }
      } catch (error) {
        localStorage.removeItem('token');
        console.error('Failed to load user:', error);
      }
    };
    loadUser();
  }, []);

  // Login user
   const login = async (email, password) => {
    dispatch({ type: 'LOGIN_REQUEST' });
    try {
      const res = await api.post('/users/login', { email, password });
      localStorage.setItem('token', res.data.token);
      dispatch({ type: 'LOGIN_SUCCESS', payload: res.data });
      return res.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'LOGIN_FAIL', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  // Register user
  const register = async (userData) => {
    dispatch({ type: 'REGISTER_REQUEST' });
    try {
      const res = await api.post('/users/register', userData);
      localStorage.setItem('token', res.data.token);
      dispatch({ type: 'REGISTER_SUCCESS', payload: res.data });
    } catch (error) {
      dispatch({ type: 'REGISTER_FAIL', payload: error.response?.data?.message || 'Registration failed' });
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT', payload: null });
  };

   return (
    <AuthContext.Provider
      value={{
        user: state.user,
        loading: state.loading,
        error: state.error,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);