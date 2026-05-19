import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AuthProvider } from './auth/AuthProvider.tsx'
import { AuthGate } from './components/AuthGate.tsx'
import { AppRouter } from './routes/AppRouter.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <AuthGate>
        <AppRouter />
      </AuthGate>
    </AuthProvider>
  </StrictMode>,
)
