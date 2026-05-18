import type { ReactNode } from 'react'
import { useAuth } from '../auth/useAuth'
import './AuthGate.css'

interface AuthGateProps {
  children: ReactNode
}

export function AuthGate({ children }: AuthGateProps) {
  const { status, errorMessage, errorDetails, retry } = useAuth()

  if (status === 'loading') {
    return (
      <div className="auth-state" role="status" aria-live="polite">
        <p>Validando sessão…</p>
      </div>
    )
  }

  if (status === 'unauthorized') {
    return (
      <div className="auth-state auth-state--denied" role="alert">
        <h1>Acesso negado</h1>
        <p>
          Sua sessão não está ativa ou você não tem permissão para acessar este
          módulo. Faça login na aplicação principal e tente novamente.
        </p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="auth-state auth-state--error" role="alert">
        <h1>Erro de autenticação</h1>
        <p>{errorMessage ?? 'Não foi possível validar a sessão.'}</p>
        {errorMessage === 'Resposta de sessão inválida' && errorDetails ? (
          <pre className="auth-state__response">{errorDetails}</pre>
        ) : null}
        <button type="button" onClick={retry}>
          Tentar novamente
        </button>
      </div>
    )
  }

  return <>{children}</>
}
