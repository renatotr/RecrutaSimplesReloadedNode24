import { useAuth } from './auth/useAuth'
import './App.css'

function App() {
  const { user } = useAuth()

  return (
    <main className="app">
      <h1>Recruta Simples</h1>
      <p className="subtitle">
        Módulo em desenvolvimento — esta página será substituída pelas telas do
        projeto.
      </p>
      {user?.name ? (
        <p className="greeting">Olá, {user.name}</p>
      ) : null}
    </main>
  )
}

export default App
