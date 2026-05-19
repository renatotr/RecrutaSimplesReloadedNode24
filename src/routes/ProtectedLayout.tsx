import { NavLink, Outlet } from 'react-router-dom'
import { Can } from '../components/Can'
import { P } from '../config/permissions'
import './ProtectedLayout.css'

export function ProtectedLayout() {
  return (
    <div className="layout">
      <nav className="layout__nav" aria-label="Principal">
        <NavLink to="/" className="layout__link" end>
          Início
        </NavLink>
        <Can permission={P.CONFIGURATION_MAINMENU_READ}>
          <NavLink to="/configuracoes" className="layout__link">
            Configurações
          </NavLink>
        </Can>
        <Can permission={P.CAMPAIGNS_READ}>
          <NavLink to="/campaigns" className="layout__link">
            Campanhas
          </NavLink>
        </Can>
      </nav>
      <div className="layout__content">
        <Outlet />
      </div>
    </div>
  )
}
