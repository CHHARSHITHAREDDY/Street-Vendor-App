import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { io } from 'socket.io-client';

// Initialize a shared socket connection
export const socket = io(process.env.REACT_APP_API_BASE || 'http://localhost:5000', {
  transports: ['websocket'],
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);



