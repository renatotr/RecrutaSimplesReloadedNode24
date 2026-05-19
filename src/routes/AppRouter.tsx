import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { RequirePermission } from '../auth/RequirePermission'
import { CampaignsPage } from '../pages/campaigns/CampaignsPage'
import { ConfiguracoesPage } from '../pages/configuracoes/ConfiguracoesPage'
import { ForbiddenPage } from './ForbiddenPage'
import { ProtectedLayout } from './ProtectedLayout'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ProtectedLayout />}>
          <Route index element={<Navigate to="/configuracoes" replace />} />
          <Route
            path="configuracoes"
            element={
              <RequirePermission>
                <ConfiguracoesPage />
              </RequirePermission>
            }
          />
          <Route
            path="campaigns"
            element={
              <RequirePermission>
                <CampaignsPage />
              </RequirePermission>
            }
          />
          <Route path="forbidden" element={<ForbiddenPage />} />
          <Route path="*" element={<Navigate to="/configuracoes" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
