// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import './index.css';
// import App from './App';
// import { io } from 'socket.io-client';

// // Initialize a shared socket connection
// export const socket = io(process.env.REACT_APP_API_BASE || 'http://localhost:5000', {
//   transports: ['websocket'],
// });

// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { io } from 'socket.io-client';

// Determine backend URL automatically
const SOCKET_URL =
  process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_API_URL            // ⬅ use your deployed backend URL
    : "http://localhost:5000";

// Create socket connection
export const socket = io(SOCKET_URL, {
  transports: ["websocket"],
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);



