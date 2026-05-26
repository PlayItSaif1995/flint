import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export default function Notifications() {
  const nav = useNavigate()
  const { user } = useAuth()
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadNotifs() }, [])

  async function loadNotifs() {
    // Load real matches and applications as notifications
    const [{ data: matches }, { data: apps }] = await Promise.all([
      supabase.from('matches').select('*, jobs(title, companies(name))').or(`candidate_id.eq.${user.id},employer_id.eq.${user.id}`).order('created_at', { ascending: false }).limit(20),
      supabase.from('applications').select('*, jobs(title, companies(name))').eq('candidate_id', user.id).order('created_at', { ascending: false }).limit(20)
    ])

    const items = []

    // Add match notifications — only show from the other person's perspective
    ;(matches || []).forEach(m => {
      const isCandidate = user.id === m.candidate_id
      // Skip headhunt matches where user is the employer (they sent it, not received it)
      if (m.headhunt && !isCandidate) return
      items.push({
        id: `match-${m.id}`,
        icon: (m.jobs?.companies?.name || 'CO').substring(0,2).toUpperCase(),
        bg: '#4F46E5',
        title: m.headhunt
          ? `A company sent you a headhunt spark!`
          : isCandidate
            ? `${m.jobs?.companies?.name || 'A company'} sparked you — mutual match!`
            : `You sparked a candidate for ${m.jobs?.title || 'a role'}`,
        time: timeAgo(m.created_at),
        unread: isCandidate ? !m.candidate_read : !m.employer_read,
        path: `/chat/${m.id}`
      })
    })

    // Add application status notifications
    ;(apps || []).forEach(a => {
      if (a.status === 'pending') return // don't show boring pending ones
      items.push({
        id: `app-${a.id}`,
        icon: (a.jobs?.companies?.name || 'CO').substring(0,2).toUpperCase(),
        bg: '#059669',
        title: a.status === 'reviewing'
          ? `${a.jobs?.companies?.name} is reviewing your application for ${a.jobs?.title}`
          : a.status === 'sparked'
          ? `${a.jobs?.companies?.name} sparked you for ${a.jobs?.title}!`
          : `Update on your application at ${a.jobs?.companies?.name}`,
        time: timeAgo(a.created_at),
        unread: false,
        path: '/applications'
      })
    })

    // Sort by time
    items.sort((a, b) => (b.unread ? 1 : 0) - (a.unread ? 1 : 0))
    setNotifs(items)
    setLoading(false)
  }

  function timeAgo(ts) {
    if (!ts) return ''
    const diff = Date.now() - new Date(ts).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins} minute${mins>1?'s':''} ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs} hour${hrs>1?'s':''} ago`
    const days = Math.floor(hrs / 24)
    return `${days} day${days>1?'s':''} ago`
  }

  return (
    <>
      <div className="status-bar" style={{ background:'var(--bg2)' }}><span>9:41</span><div className="status-icons"><i className="ti ti-wifi"/><i className="ti ti-battery-2"/></div></div>
      <div className="page-header">
        <button onClick={() => nav(-1)} style={{ background:'none', border:'none', cursor:'pointer' }}><i className="ti ti-arrow-left" style={{ fontSize:18, color:'var(--t2)' }}/></button>
        <h1>Notifications</h1>
      </div>
      <div className="scroll" style={{ background:'var(--bg)' }}>
        {loading && <div style={{ padding:24, textAlign:'center', color:'var(--t3)' }}><i className="ti ti-loader spin"/></div>}
        {!loading && notifs.length === 0 && (
          <div style={{ padding:40, textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
            <i className="ti ti-bell-off" style={{ fontSize:32, color:'var(--t3)' }}/>
            <div style={{ fontSize:13, color:'var(--t3)' }}>No notifications yet</div>
            <div style={{ fontSize:11, color:'var(--t3)' }}>When you get sparks or application updates, they'll show here</div>
          </div>
        )}
        {notifs.map(item => (
          <div key={item.id} className={`notif-item ${item.unread ? 'unread' : ''}`} onClick={() => nav(item.path)}>
            <div className="notif-av" style={{ background: item.bg, borderRadius:8 }}>
              <span style={{ fontSize:13, fontWeight:500 }}>{item.icon}</span>
            </div>
            <div className="notif-content">
              <div className="notif-title">{item.title}</div>
              <div className="notif-time">{item.time}</div>
            </div>
            {item.unread && <div className="unread-dot"/>}
          </div>
        ))}
      </div>
    </>
  )
}
