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
    const { data } = await supabase.from('matches').select('*, jobs(title), cand_profile:profiles!matches_candidate_id_fkey(full_name, job_title)').eq('employer_id', user.id).order('last_message_at', { ascending:false })
    setMatches(data || [])
    setLoading(false)
  }

  const COLORS = ['#E8832A','#7C3AED','#059669']

  return (
    <>
      <div className="status-bar" style={{ background:'var(--bg2)' }}><span>9:41</span><div className="status-icons"><i className="ti ti-wifi"/><i className="ti ti-battery-2"/></div></div>
      <div className="page-header"><h1>Active sparks</h1></div>
      <div className="scroll" style={{ background:'var(--bg)' }}>
        {loading && <div style={{ padding:24, textAlign:'center', color:'var(--t3)' }}><i className="ti ti-loader spin"/></div>}
        {!loading && matches.length === 0 && (
          <div style={{ padding:32, textAlign:'center' }}>
            <i className="ti ti-flame" style={{ fontSize:32, color:'var(--t3)', display:'block', marginBottom:12 }}/>
            <div style={{ fontSize:13, color:'var(--t3)' }}>No sparks yet. Review your shortlists and spark candidates.</div>
          </div>
        )}
        {matches.map((m, i) => {
          const cand = m.cand_profile
          return (
            <div key={m.id} className={`notif-item ${!m.employer_read ? 'unread' : ''}`} onClick={() => nav(`/chat/${m.id}`)}>
              <div className="notif-av" style={{ background: COLORS[i%COLORS.length], borderRadius:8 }}>
                {(cand?.full_name || 'C').split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}
              </div>
              <div className="notif-content">
                <div className="notif-title"><strong>{cand?.full_name || 'Candidate'}</strong> — {m.jobs?.title}</div>
                {m.last_message && <div style={{ fontSize:11, color:'#aaa', marginTop:2 }}>"{m.last_message.substring(0,50)}{m.last_message.length>50?'...':''}"</div>}
                <div className="notif-time">{m.last_message_at ? new Date(m.last_message_at).toLocaleDateString() : 'Just now'}</div>
              </div>
              {!m.employer_read && <div className="unread-dot"/>}
            </div>
          )
        })}
      </div>
      <EmpNav/>
    </>
  )
}
