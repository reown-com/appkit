import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './App.js'
import { SolanaContext } from './SolanaContext.js'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SolanaContext>
      <App />
    </SolanaContext>
  </React.StrictMode>
)
