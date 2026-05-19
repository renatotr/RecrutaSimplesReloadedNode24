import { formatResponsePayload } from '../api/client'
import { useAuth } from '../auth/useAuth'
import './HomePage.css'

export function HomePage() {
  const { user } = useAuth()

  return (
    <main className="page">
      <h1>Recruta Simples</h1>
      <p className="page__subtitle">
        Módulo em desenvolvimento — esta página será substituída pelas telas do
        projeto.
      </p>
      {user ? (
        <section className="session-debug" aria-label="Dados da sessão">
          <div className="session-debug__block">
            <h2 className="session-debug__label">SessionUser</h2>
            <pre className="session-debug__payload">
              {formatResponsePayload(user)}
            </pre>
          </div>
          <div className="session-debug__block">
            <h2 className="session-debug__label">SessionRole</h2>
            <pre className="session-debug__payload">
              {formatResponsePayload(user.roles ?? [])}
            </pre>
          </div>
          <div className="session-debug__block">
            <h2 className="session-debug__label">SessionPermission</h2>
            <pre className="session-debug__payload">
              {formatResponsePayload(user.permissions ?? [])}
            </pre>
          </div>
        </section>
      ) : null}
    </main>
  )
}
