import { useNavigate, useLocation } from 'react-router-dom'

export default function CandNav({ unreadSparks = 0 }) {
  const nav = useNavigate()
  const { pathname } = useLocation()

  const items = [
    { path: '/discover', icon: 'ti-flame', label: 'Discover' },
    { path: '/applications', icon: 'ti-file-text', label: 'Applied' },
    { path: '/sparks', icon: 'ti-message-circle', label: 'Sparks', badge: unreadSparks },
    { path: '/settings', icon: 'ti-user', label: 'Profile' },
  ]

  return (
    <nav className="bnav">
      {items.map(item => (
        <button key={item.path} className={`bnav-btn ${pathname === item.path || (item.path === '/settings' && pathname.startsWith('/settings')) ? 'active' : ''}`} onClick={() => nav(item.path)}>
          <i className={`ti ${item.icon}`}/>
          {item.badge > 0 && <div className="bnav-badge">{item.badge}</div>}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}
