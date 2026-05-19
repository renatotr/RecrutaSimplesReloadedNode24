import { P } from '../../config/permissions'
import '../Page.css'

export function ConfiguracoesPage() {
  return (
    <main className="page">
      <h1>Configurações</h1>
      <p className="page__subtitle">
        Página de configuração do módulo Recruta Simples.
      </p>

      <section className="page__section">
        <h2 className="page__section-title">
          Visível com {P.CONFIGURATION_MAINMENU_READ}
        </h2>
        <p>Conteúdo principal da configuração.</p>
      </section>
    </main>
  )
}
