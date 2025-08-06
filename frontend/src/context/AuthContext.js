import { createContext, useContext, useReducer, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext();

const initialState = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_REQUEST':
    case 'REGISTER_REQUEST':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      return { 
        ...state, 
        loading: false, 
        user: action.payload,
        isAuthenticated: true,
        error: null 
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false
      };
    case 'LOGIN_FAIL':
    case 'REGISTER_FAIL':
    case 'AUTH_FAIL':
      return { 
        ...state, 
        loading: false, 
        error: action.payload,
        isAuthenticated: false 
      };
    case 'LOGOUT':
      return { 
        ...initialState,
        isAuthenticated: false 
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      dispatch({ type: 'LOGIN_REQUEST' });
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const res = await api.get('/users/profile');
          dispatch({ type: 'AUTH_SUCCESS', payload: res.data });
        } else {
          dispatch({ type: 'AUTH_FAIL', payload: 'Not authenticated' });
        }
      } catch (error) {
        localStorage.removeItem('token');
        dispatch({ type: 'AUTH_FAIL', payload: error.response?.data?.message || 'Authentication failed' });
      }
    };
    checkAuth();
  }, []);


const login = async (email, password) => {
  dispatch({ type: 'LOGIN_REQUEST' });
  try {
    const res = await api.post('/users/login', { email, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    dispatch({ 
      type: 'LOGIN_SUCCESS', 
      payload: res.data.user 
    });
    return true; 
  } catch (error) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ 
      type: 'LOGIN_FAIL', 
      payload: error.response?.data?.message || 'Login failed' 
    });
    return false;
  }
};

  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        loading: state.loading,
        error: state.error,
        isAuthenticated: state.isAuthenticated,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);