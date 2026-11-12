import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PwaStatus } from './components/layout/PwaStatus'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <PwaStatus />
  </StrictMode>,
)
