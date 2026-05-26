import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import EmpNav from '../../components/EmpNav'

export default function EmpSparks() {
  const nav = useNavigate()
  const { user } = useAuth()
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadMatches() }, [])

  async function loadMatches() {
    const { data, error } = await supabase
      .from('matches')
      .select('*, jobs(title), cand_profile:profiles!matches_candidate_id_fkey(full_name, job_title, profession)')
      .eq('employer_id', user.id)
      .order('last_message_at', { ascending: false, nullsFirst: false })
    
    if (error) console.error('EmpSparks load error:', error)
    setMatches(data || [])
    setLoading(false)
  }

  const COLORS = ['#E8832A','#7C3AED','#059669','#DC2626','#0891B2','#4F46E5']

  return (
    <>
      <div className="status-bar" style={{ background:'var(--bg2)' }}><span>9:41</span><div className="status-icons"><i className="ti ti-wifi"/><i className="ti ti-battery-2"/></div></div>
      <div className="page-header"><h1>Sparks</h1><span style={{ fontSize:11, color:'var(--t3)' }}>{matches.length} active</span></div>
      <div className="scroll" style={{ background:'var(--bg)' }}>
        {loading && <div style={{ padding:24, textAlign:'center', color:'var(--t3)' }}><i className="ti ti-loader spin"/></div>}
        {!loading && matches.length === 0 && (
          <div style={{ padding:40, textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
            <i className="ti ti-flame" style={{ fontSize:36, color:'var(--t3)' }}/>
            <div style={{ fontSize:14, fontWeight:500, color:'#fff' }}>No sparks yet</div>
            <div style={{ fontSize:12, color:'var(--t3)', textAlign:'center', lineHeight:1.6 }}>Go to your shortlist and spark candidates to start chatting</div>
            <button className="btn-sm primary" style={{ marginTop:8 }} onClick={() => nav('/employer')}>
              <i className="ti ti-arrow-left"/>Back to dashboard
            </button>
          </div>
        )}
        {matches.map((m, i) => {
          const cand = m.cand_profile
          const initials = (cand?.full_name || 'C').split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase()
          return (
            <div key={m.id} className={`notif-item ${!m.employer_read ? 'unread' : ''}`} onClick={() => nav(`/chat/${m.id}`)}>
              <div className="notif-av" style={{ background: COLORS[i % COLORS.length], borderRadius:10, fontSize:14, fontWeight:500 }}>
                {initials}
              </div>
              <div className="notif-content">
                <div className="notif-title">
                  <strong>{cand?.full_name || 'Candidate'}</strong>
                  {m.jobs?.title && <span style={{ color:'var(--t2)', fontWeight:400 }}> — {m.jobs.title}</span>}
                </div>
                <div style={{ fontSize:11, color:'var(--t2)', marginTop:2 }}>
                  {cand?.job_title || cand?.profession || 'Candidate'}
                </div>
                {m.last_message && (
                  <div style={{ fontSize:11, color:'var(--t3)', marginTop:2 }}>
                    "{m.last_message.substring(0,50)}{m.last_message.length > 50 ? '...' : ''}"
                  </div>
                )}
                <div className="notif-time">
                  {m.last_message_at ? new Date(m.last_message_at).toLocaleDateString('en-GB', { day:'numeric', month:'short' }) : 'Just sparked'}
                  {m.headhunt && <span style={{ color:'var(--purple)', marginLeft:6 }}>· Headhunt</span>}
                </div>
              </div>
              {!m.employer_read && <div className="unread-dot"/>}
              <i className="ti ti-chevron-right" style={{ fontSize:14, color:'var(--t3)', flexShrink:0 }}/>
            </div>
          )
        })}
        <div style={{ height:14 }}/>
      </div>
      <EmpNav unreadSparks={matches.filter(m => !m.employer_read).length}/>
    </>
  )
}
