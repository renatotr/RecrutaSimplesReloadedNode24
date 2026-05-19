import { Can } from '../../components/Can'
import { P } from '../../config/permissions'
import '../Page.css'

export function CampaignsPage() {
  return (
    <main className="page">
      <h1>Campanhas</h1>
      <p className="page__subtitle">Listagem e gestão de campanhas.</p>

      <section className="page__section">
        <h2 className="page__section-title">Visível com campaigns.read</h2>
        <p>Lista de campanhas (em desenvolvimento).</p>
      </section>

      <Can permission={P.CAMPAIGNS_WRITE}>
        <section className="page__section page__section--highlight">
          <h2 className="page__section-title">Nova campanha</h2>
          <button type="button">Criar campanha</button>
        </section>
      </Can>
    </main>
  )
}
