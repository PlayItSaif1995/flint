import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import CandNav from '../../components/CandNav'

export default function Sparks() {
  const nav = useNavigate()
  const { user } = useAuth()
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadMatches() }, [])

  async function loadMatches() {
    const { data } = await supabase
      .from('matches')
      .select('*, jobs(title, companies(name)), last_message, last_message_at, candidate_read')
      .eq('candidate_id', user.id)
      .neq('status', 'unmatched')
      .order('last_message_at', { ascending: false, nullsFirst: false })
    setMatches(data || [])
    setLoading(false)
  }

  return (
    <>
      <div className="status-bar" style={{ background:'var(--bg2)' }}><span>9:41</span><div className="status-icons"><i className="ti ti-wifi"/><i className="ti ti-battery-2"/></div></div>
      <div className="page-header"><h1>Sparks</h1></div>
      <div className="scroll" style={{ background:'var(--bg)' }}>
        {loading && <div style={{ padding:24, textAlign:'center', color:'var(--t3)' }}><i className="ti ti-loader spin"/></div>}
        {!loading && matches.length === 0 && (
          <div style={{ padding:32, textAlign:'center' }}>
            <i className="ti ti-flame" style={{ fontSize:32, color:'var(--t3)', display:'block', marginBottom:12 }}/>
            <div style={{ fontSize:13, color:'var(--t3)' }}>No sparks yet. Apply to roles and wait for the magic.</div>
          </div>
        )}
        {matches.map(m => (
          <div key={m.id} className={`notif-item ${!m.candidate_read ? 'unread' : ''}`} onClick={() => { sessionStorage.setItem('chatFromRole', 'candidate'); nav(`/chat/${m.id}`) }}>            <div className="notif-av" style={{ background:'#4F46E5', borderRadius:8, fontSize:13 }}>
              {(m.jobs?.companies?.name || 'CO').substring(0,2).toUpperCase()}
            </div>
            <div className="notif-content">
              <div className="notif-title"><strong>{m.jobs?.companies?.name}</strong> — {m.jobs?.title}</div>
              {m.last_message && <div style={{ fontSize:11, color:'#aaa', marginTop:2 }}>"{m.last_message.substring(0,50)}{m.last_message.length>50?'...':''}"</div>}
              <div className="notif-time">{m.last_message_at ? new Date(m.last_message_at).toLocaleDateString() : 'Just now'}{!m.candidate_read && <span style={{ color:'var(--spark)', marginLeft:4 }}>New message</span>}</div>
            </div>
            {!m.candidate_read && <div className="unread-dot"/>}
          </div>
        ))}
      </div>
      <CandNav/>
    </>
  )
}
