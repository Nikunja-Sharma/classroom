import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'
import { Toaster } from './components/ui/toaster'

// Set axios defaults
axios.defaults.baseURL = 'http://localhost:5000/api' // Adjust this URL to match your backend API
axios.defaults.headers.common['Content-Type'] = 'application/json'

// Add response interceptor
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear any auth tokens if you're using them
      localStorage.removeItem('token')
      // Redirect to login
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Toaster />
  </StrictMode>,
)