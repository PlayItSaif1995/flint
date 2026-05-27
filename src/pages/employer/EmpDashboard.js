import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import EmpNav from '../../components/EmpNav'

export default function EmpDashboard() {
  const nav = useNavigate()
  const { user, profile } = useAuth()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDel, setShowDel] = useState(null)

  useEffect(() => { loadJobs() }, [])

  async function loadJobs() {
    // Try profile company_id first, then fall back to owner_id lookup
    let companyId = null
    
    if (profile?.company_id) {
      companyId = profile.company_id
    } else {
      const { data: company } = await supabase.from('companies').select('id').eq('owner_id', user.id).maybeSingle()
      companyId = company?.id
    }

    if (!companyId) { setLoading(false); return }
    const { data } = await supabase.from('jobs').select('*, applications(count)').eq('company_id', companyId).order('created_at', { ascending:false })
    setJobs(data || [])
    setLoading(false)
  }

  async function deleteJob(id) {
    const { error } = await supabase.from('jobs').delete().eq('id', id)
    if (error) { console.error('Delete job error:', error); return }
    setShowDel(null)
    // Reload from DB to confirm deletion
    await loadJobs()
  }

  async function toggleStatus(job) {
    const newStatus = job.status === 'active' ? 'paused' : 'active'
    await supabase.from('jobs').update({ status: newStatus }).eq('id', job.id)
    setJobs(jobs.map(j => j.id === job.id ? {...j, status: newStatus} : j))
  }

  return (
    <>
      <div className="status-bar"><span>9:41</span><div className="status-icons"><i className="ti ti-wifi"/><i className="ti ti-battery-2"/></div></div>
      <div style={{ background:'var(--bg)', padding:'7px 16px 9px', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div className="logo-icon" style={{ width:28, height:28 }}>
            <svg viewBox="0 0 32 32" fill="none" width={17} height={17}><path d="M19 3L10 17H16L13 29L24 13H17.5L19 3Z" fill="white" opacity="0.95"/></svg>
          </div>
          <span className="logo-text" style={{ fontSize:18 }}>flint<span>.</span></span>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={() => nav('/employer/post-job')} style={{ background:'var(--bg3)', border:'0.5px solid var(--border)', borderRadius:8, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <i className="ti ti-plus" style={{ fontSize:16, color:'var(--t2)' }}/>
          </button>
          <button onClick={() => nav('/notifications')} style={{ background:'var(--bg3)', border:'0.5px solid var(--border)', borderRadius:8, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <i className="ti ti-bell" style={{ fontSize:16, color:'var(--t2)' }}/>
          </button>
        </div>
      </div>

      <div className="scroll" style={{ background:'var(--bg)' }}>
        <div style={{ padding:'10px 14px 5px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ fontSize:10, color:'var(--t3)' }}>{jobs.filter(j=>j.status==='active').length} ACTIVE ROLES</div>
        </div>

        {loading && <div style={{ padding:24, textAlign:'center', color:'var(--t3)' }}><i className="ti ti-loader spin"/></div>}
        {!loading && jobs.length === 0 && (
          <div style={{ padding:32, display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
            <i className="ti ti-briefcase" style={{ fontSize:36, color:'var(--t3)' }}/>
            <div style={{ fontSize:15, fontWeight:500, color:'#fff' }}>No roles posted yet</div>
            <div style={{ fontSize:12, color:'var(--t3)', textAlign:'center', marginBottom:4 }}>Post your first role and start getting applications within hours</div>
            <button className="btn-primary" style={{ width:'auto', padding:'12px 28px' }} onClick={() => nav('/employer/post-job')}><i className="ti ti-plus"/>Post your first role</button>
          </div>
        )}

        {jobs.filter(j => j.status==='active').map(job => (
          <div key={job.id} style={{ background:'var(--bg2)', border:'0.5px solid var(--border)', borderRadius:12, padding:12, margin:'8px 14px 0' }}>
            <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:8 }}>
              <div style={{ width:36, height:36, borderRadius:8, background:'#4F46E5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#fff', flexShrink:0 }}>
                {job.title.substring(0,2).toUpperCase()}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:500, color:'#fff' }}>{job.title}</div>
                <div style={{ fontSize:10, color:'var(--t2)' }}>{job.location} · {job.work_style}</div>
              </div>
            </div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:9 }}>
              <span style={{ fontSize:10, color:'var(--spark)', display:'flex', alignItems:'center', gap:3 }}><i className="ti ti-users" style={{ fontSize:11 }}/>{job.applications?.[0]?.count || 0} applicants</span>
              <span style={{ fontSize:10, color:'var(--green)', display:'flex', alignItems:'center', gap:3 }}><i className="ti ti-flame" style={{ fontSize:11 }}/>{job.spark_count || 0} sparks</span>
            </div>
            <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
              <button className="btn-sm secondary" onClick={() => nav(`/employer/shortlist/${job.id}`)}><i className="ti ti-users"/>Shortlist</button>
              <button className="btn-sm secondary" onClick={() => nav(`/employer/edit-job/${job.id}`)}><i className="ti ti-pencil"/>Edit</button>
              <button className="btn-sm secondary" onClick={() => nav('/employer/sparks')}><i className="ti ti-message-circle"/>Sparks</button>
              <button className="btn-sm danger" onClick={() => setShowDel(job.id)}><i className="ti ti-trash"/></button>
            </div>
          </div>
        ))}

        {jobs.filter(j => j.status==='paused').length > 0 && (
          <div style={{ padding:'9px 14px 0' }}>
            <div style={{ fontSize:10, color:'var(--t3)', marginBottom:6 }}>PAUSED ROLES</div>
            {jobs.filter(j => j.status==='paused').map(job => (
              <div key={job.id} style={{ background:'var(--bg2)', border:'0.5px solid var(--border)', borderRadius:12, padding:12, opacity:.55 }}>
                <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:8 }}>
                  <div style={{ flex:1 }}><div style={{ fontSize:13, fontWeight:500, color:'#fff' }}>{job.title}</div></div>
                  <span className="badge nospark">Paused</span>
                </div>
                <div style={{ display:'flex', gap:5 }}>
                  <button className="btn-sm green" onClick={() => toggleStatus(job)}><i className="ti ti-player-play"/>Reactivate</button>
                  <button className="btn-sm secondary" onClick={() => nav(`/employer/edit-job/${job.id}`)}><i className="ti ti-pencil"/>Edit</button>
                  <button className="btn-sm danger" onClick={() => setShowDel(job.id)}><i className="ti ti-trash"/></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Headhunt banner */}
        <div onClick={() => nav('/employer/headhunt')} style={{ margin:'10px 14px', background:'linear-gradient(135deg,var(--pd),#0a0a0a 60%)', border:'0.5px solid var(--pb)', borderRadius:12, padding:12, cursor:'pointer' }}>
          <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:7 }}>
            <div style={{ width:32, height:32, background:'var(--purple)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><i className="ti ti-user-search" style={{ fontSize:15, color:'#fff' }}/></div>
            <div style={{ flex:1 }}><div style={{ fontSize:12, fontWeight:500, color:'#fff' }}>Headhunt Mode</div><div style={{ fontSize:10, color:'var(--t2)' }}>Search candidates directly and spark them</div></div>
            <div style={{ background:'var(--purple)', borderRadius:6, padding:'3px 8px', fontSize:10, fontWeight:600, color:'#fff' }}>Try it</div>
          </div>
        </div>
        <div style={{ height:14 }}/>
      </div>

      {showDel && (
        <div className="modal-overlay" onClick={() => setShowDel(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Delete this role?</div>
            <div className="modal-sub">Removes the listing immediately. Applicants will no longer see it. Cannot be undone.</div>
            <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
              <button className="btn-primary" style={{ background:'var(--red)', color:'#fff', marginBottom:0 }} onClick={() => deleteJob(showDel)}><i className="ti ti-trash"/> Yes, delete</button>
              <button className="btn-secondary" onClick={() => setShowDel(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      <EmpNav/>
    </>
  )
}
