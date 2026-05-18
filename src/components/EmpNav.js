import { useNavigate, useLocation } from 'react-router-dom'

export default function EmpNav({ unreadSparks = 0 }) {
  const nav = useNavigate()
  const { pathname } = useLocation()

  const items = [
    { path: '/employer', icon: 'ti-layout-dashboard', label: 'Dashboard' },
    { path: '/employer/headhunt', icon: 'ti-user-search', label: 'Headhunt' },
    { path: '/employer/sparks', icon: 'ti-message-circle', label: 'Sparks', badge: unreadSparks },
    { path: '/employer/settings', icon: 'ti-building', label: 'Company' },
  ]

  return (
    <nav className="bnav">
      {items.map(item => (
        <button key={item.path} className={`bnav-btn ${pathname.startsWith(item.path) && (item.path !== '/employer' || pathname === '/employer') ? 'active' : ''}`} onClick={() => nav(item.path)}>
          <i className={`ti ${item.icon}`}/>
          {item.badge > 0 && <div className="bnav-badge">{item.badge}</div>}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}
