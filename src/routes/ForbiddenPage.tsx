import './ForbiddenPage.css'

export function ForbiddenPage() {
  return (
    <div className="forbidden" role="alert">
      <h1>Sem permissão</h1>
      <p>
        Você está autenticado, mas não tem permissão para acessar esta página.
        Solicite acesso ao administrador se necessário.
      </p>
    </div>
  )
}
