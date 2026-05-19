import { Can } from '../../components/Can'
import { P } from '../../config/permissions'
import { DeactivatePositionsBlock } from './DeactivatePositionsBlock'
import './ConfiguracoesPage.css'

export function ConfiguracoesPage() {
  return (
    <main className="page page--config">
      <header className="page__header">
        <h1>Configurações</h1>
        <p className="page__subtitle">
          Gerencie as opções do módulo Recruta Simples. Novos blocos de
          configuração podem ser adicionados nesta página.
        </p>
      </header>

      <div className="config-blocks">
        <Can permission={P.CONFIGURATION_OPTIONS_DEACTIVATE_EMAIL_READ}>
          <DeactivatePositionsBlock />
        </Can>
      </div>
    </main>
  )
}
