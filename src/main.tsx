import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import HubButton from './shared/HubButton'
import AuthGate from './shared/AuthGate'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthGate>
      <HubButton />
      <App />
    </AuthGate>
  </StrictMode>,
)
