import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import CandNav from '../../components/CandNav'

const FILTERS = ['All','Sparked','Reviewing','Pending','Closed']
const STATUS_CONFIG = {
  pending: { label:'Pending', cls:'pending', steps:[true,false,false,false] },
  reviewing: { label:'Reviewing', cls:'reviewing', steps:[true,true,false,false] },
  sparked: { label:'Sparked ⚡', cls:'sparked', steps:[true,true,true,false] },
  interview: { label:'Interview', cls:'purple-b', steps:[true,true,true,true] },
  closed: { label:'Not taken forward', cls:'nospark', steps:[true,false,false,false] },
}

export default function Applications() {
  const nav = useNavigate()
  const { user } = useAuth()
  const [apps, setApps] = useState([])
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadApps() }, [])

  async function loadApps() {
    const { data } = await supabase.from('applications').select('*, jobs(title, salary_min, salary_max, work_style, companies(name, location))').eq('candidate_id', user.id).order('created_at', { ascending:false })
    setApps(data || [])
    setLoading(false)
  }

  const filtered = filter === 'All' ? apps : apps.filter(a => a.status === filter.toLowerCase())

  return (
    <>
      <div className="status-bar" style={{ background:'var(--bg2)' }}><span>9:41</span><div className="status-icons"><i className="ti ti-wifi"/><i className="ti ti-battery-2"/></div></div>
      <div className="page-header"><h1>My applications</h1><span style={{ fontSize:11, color:'var(--t3)' }}>{apps.length} total</span></div>

      {/* Filter chips */}
      <div style={{ display:'flex', gap:5, padding:'9px 13px', overflowX:'auto', flexShrink:0, background:'var(--bg2)', borderBottom:'0.5px solid var(--border)' }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding:'5px 12px', borderRadius:99, border: filter===f ? 'none' : '0.5px solid var(--border2)', background: filter===f ? 'var(--spark)' : 'var(--bg3)', color: filter===f ? '#000' : 'var(--t2)', fontSize:11, fontWeight:500, fontFamily:'inherit', cursor:'pointer', whiteSpace:'nowrap', flexShrink:0 }}>
            {f}
          </button>
        ))}
      </div>

      <div className="scroll" style={{ background:'var(--bg)' }}>
        {loading && <div style={{ padding:24, textAlign:'center', color:'var(--t3)' }}><i className="ti ti-loader spin"/></div>}
        {!loading && filtered.length === 0 && (
          <div style={{ padding:32, textAlign:'center', color:'var(--t3)', fontSize:13 }}>
            {filter === 'All' ? 'No applications yet. Start swiping!' : `No ${filter.toLowerCase()} applications`}
          </div>
        )}
        {filtered.map(app => {
          const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending
          const job = app.jobs
          return (
            <div key={app.id} onClick={() => app.status === 'sparked' ? nav(`/chat/${app.id}`) : null} style={{ background:'var(--bg2)', border:'0.5px solid var(--border)', borderRadius:12, margin:'7px 13px 0', padding:12, cursor: app.status==='sparked' ? 'pointer' : 'default' }}>
              <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:8 }}>
                <div style={{ width:36, height:36, borderRadius:8, background:'#4F46E5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#fff', flexShrink:0 }}>
                  {(job?.companies?.name || 'CO').substring(0,2).toUpperCase()}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:500, color:'#fff' }}>{job?.title || 'Role'}</div>
                  <div style={{ fontSize:10, color:'var(--t2)' }}>{job?.companies?.name}</div>
                </div>
                <span className={`badge ${cfg.cls}`}><div className="badge-dot"/>{cfg.label}</span>
              </div>
              {job?.salary_min && <div style={{ fontSize:10, color:'var(--t2)', marginBottom:7 }}>£{Math.round(job.salary_min/1000)}–{Math.round(job.salary_max/1000)}k · {job.work_style} · {job.companies?.location}</div>}
              <div className="progress-track">
                {['Applied','Reviewing','Sparked','Interview'].map((step, i) => (
                  <div key={step} style={{ display:'contents' }}>
                    <div className="prog-node">
                      <div className={`prog-dot ${cfg.steps[i] ? (i === cfg.steps.filter(Boolean).length-1 ? 'active' : 'done') : ''}`}/>
                      <span className={`prog-label ${cfg.steps[i] && i === cfg.steps.filter(Boolean).length-1 ? 'active' : ''}`}>{step}</span>
                    </div>
                    {i < 3 && <div className={`prog-line ${cfg.steps[i] && cfg.steps[i+1] ? 'done' : ''}`}/>}
                  </div>
                ))}
              </div>
              {app.status === 'sparked' && <div style={{ marginTop:8, fontSize:10, color:'var(--green)', display:'flex', alignItems:'center', gap:4 }}><i className="ti ti-message-circle" style={{ fontSize:12 }}/>New message — tap to open chat</div>}
            </div>
          )
        })}
        <div style={{ height:13 }}/>
      </div>
      <CandNav/>
    </>
  )
}
