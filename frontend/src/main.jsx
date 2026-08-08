import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Global fetch interceptor to automatically handle 401 Unauthorized errors
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  const response = await originalFetch(...args);
  if (response.status === 401) {
    if (localStorage.getItem('token')) {
      localStorage.removeItem('token');
      // Reload the page to force the user back to the landing/login view
      window.location.reload();
    }
  }
  return response;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
