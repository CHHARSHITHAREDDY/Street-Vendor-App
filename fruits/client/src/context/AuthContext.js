import React, { createContext, useContext, useReducer, useEffect } from 'react';

import api from '../api/axios'; 
const AuthContext = createContext();

const initialState = {
  user: null,
  userType: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  error: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
    case 'REGISTER_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        userType: action.payload.userType,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        userType: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        userType: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

 

  // Load user on app start
  useEffect(() => {
    const loadUser = async () => {
      if (state.token) {
        try {
          const response = await api.get('/api/auth/me');
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user: response.data.user,
              userType: response.data.user.userType,
              token: state.token
            }
          });
        } catch (error) {
          console.error('Load user error:', error);
          localStorage.removeItem('token');
          dispatch({ type: 'AUTH_ERROR', payload: 'Session expired' });
        }
      } else {
        dispatch({ type: 'AUTH_ERROR', payload: null });
      }
    };

    loadUser();
  }, [state.token]);

  const login = async (email, password, userType) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const response = await api.post(`/api/auth/${userType}/login`, {
        email,
        password
      });

      const { token, user } = response.data;
      localStorage.setItem('token', token);

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user,
          userType,
          token
        }
      });

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'AUTH_ERROR', payload: message });
      return { success: false, error: message };
    }
  };

  const register = async (userData, userType) => {
    dispatch({ type: 'REGISTER_START' });
    
    try {
      const response = await api.post(`/api/auth/${userType}/register`, userData);

      const { token, user } = response.data;
      localStorage.setItem('token', token);

      dispatch({
        type: 'REGISTER_SUCCESS',
        payload: {
          user,
          userType,
          token
        }
      });

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'AUTH_ERROR', payload: message });
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    clearError,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};




