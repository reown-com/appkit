import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './App.jsx'
import './assets/main.css'
import './config.js'

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
