import { useState } from 'react'
import { Can } from '../../components/Can'
import {
  PageBackLink,
  PageBanner,
  PageShell,
  TabBar,
  type TabItem,
} from '../../components/layout'
import { formatResponsePayload } from '../../api/client'
import { useAuth } from '../../auth/useAuth'
import { P } from '../../config/permissions'
import { DeactivatePositionsBlock } from './DeactivatePositionsBlock'
import { DeactivationReportBlock } from './DeactivationReportBlock'
import './ConfiguracoesPage.css'
import './DeactivationReportBlock.css'

function UserBannerLabel({
  name,
  email,
}: {
  name?: string
  email?: string
}) {
  const displayName = name?.trim() || 'não informado'
  const displayEmail = email?.trim() || 'não informado'

  return (
    <>
      <p className="rs-banner__user-line">
        <strong>Usuário:</strong> {displayName}
      </p>
      <p className="rs-banner__user-line">
        <strong>Email:</strong> {displayEmail}
      </p>
    </>
  )
}

function ThemeBannerMeta({
  theme,
  isUserAdmin,
}: {
  theme?: string | null
  isUserAdmin?: boolean
}) {
  const displayTheme = theme?.trim() || 'usuário sem tema definido'

  return (
    <>
      <p className="rs-banner__user-line">
        <strong>Theme:</strong> {displayTheme}
      </p>
      {isUserAdmin ? (
        <p className="rs-banner__admin-badge">USUÁRIO ADMINISTRADOR</p>
      ) : null}
    </>
  )
}

const CONFIG_TABS: TabItem[] = [
  { id: 'deactivate', label: 'Desativar vagas antigas' },
  { id: 'password', label: 'Alterar senha' },
]

function isDevOrTestEnvironment(): boolean {
  const nodeEnv = import.meta.env.NODE_ENV
  return nodeEnv === 'development' || nodeEnv === 'test'
}

export function ConfiguracoesPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('deactivate')

  return (
    <PageShell>
      <PageBackLink>← Voltar para o menu anterior</PageBackLink>

      <article className="rs-card page--config">
        <PageBanner
          title="Configurações"
          label={
            <UserBannerLabel name={user?.name} email={user?.email} />
          }
          meta={
            <ThemeBannerMeta
              theme={user?.theme}
              isUserAdmin={user?.is_user_admin === true}
            />
          }
        />

        <TabBar
          tabs={CONFIG_TABS}
          activeId={activeTab}
          onTabChange={setActiveTab}
        />

        <div
          className="rs-card__body"
          role="tabpanel"
          id={`panel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
        >
          {activeTab === 'deactivate' && (
            <Can permission={P.CONFIGURATION_OPTIONS_DEACTIVATE_EMAIL_READ}>
              <div className="config-deactivate-tab">
                <DeactivatePositionsBlock />
                <div
                  className="config-section-separator"
                  role="separator"
                  aria-label="Relatório de desativações"
                />
                <DeactivationReportBlock />
              </div>
            </Can>
          )}

          {activeTab === 'password' && (
            <p className="rs-card__body--muted">
              {user?.loginType === 'adlogin'
                ? 'Seu login é realizado via Microsoft e sua senha só pode ser alterada através do sistema de autenticação da Microsoft.'
                : 'Bloco "Alterar senha" — em desenvolvimento.'}
            </p>
          )}
        </div>
      </article>

      {activeTab === 'deactivate' && isDevOrTestEnvironment() ? (
        <section
          className="config-dev-debug"
          aria-label="Debug: configuration da sessão"
        >
          <h2 className="config-dev-debug__title">
            CONFIGURATION (DEVELOPMENT OR TEST ENVIRONMENT ONLY)
          </h2>
          <pre className="config-dev-debug__payload">
            {user?.configuration == null
              ? 'configuration null'
              : formatResponsePayload(user.configuration)}
          </pre>
        </section>
      ) : null}
    </PageShell>
  )
}
