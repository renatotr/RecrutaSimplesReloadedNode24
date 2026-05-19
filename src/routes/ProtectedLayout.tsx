import { Outlet } from 'react-router-dom'
import './ProtectedLayout.css'

export function ProtectedLayout() {
  return (
    <div className="layout">
      <Outlet />
    </div>
  )
}
