import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import EmpNav from '../../components/EmpNav'

export default function Shortlist() {
  const nav = useNavigate()
  const { jobId } = useParams()
  const { user } = useAuth()
  const [job, setJob] = useState(null)
  const [applicants, setApplicants] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [jobId])

  async function loadData() {
    const { data: jobData } = await supabase.from('jobs').select('*, companies(name)').eq('id', jobId).single()
    const { data: apps, error } = await supabase
      .from('applications')
      .select('id, candidate_id, status, created_at, profiles(full_name, job_title, profession, seniority, current_employer, skills, location_name, bio)')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false })
    
    if (error) console.error('Shortlist load error:', error)
    setJob(jobData)
    setApplicants(apps || [])
    setLoading(false)
  }

  async function sparkCandidate(app) {
    // Get company - try profile first then query
    let companyId = null
    const { data: company } = await supabase.from('companies').select('id').eq('owner_id', user.id).maybeSingle()
    companyId = company?.id

    if (!companyId) {
      console.error('No company found for user', user.id)
      return
    }

    // Check if match already exists
    const { data: existing } = await supabase.from('matches')
      .select('id').eq('candidate_id', app.candidate_id).eq('job_id', jobId).maybeSingle()

    if (!existing) {
      const { error } = await supabase.from('matches').insert({ 
        candidate_id: app.candidate_id, 
        employer_id: user.id, 
        job_id: jobId, 
        company_id: companyId, 
        status: 'matched', 
        candidate_read: false, 
        employer_read: true, 
        last_message_at: new Date().toISOString() 
      })
      if (error) { console.error('Match insert error:', error); return }
    }

    await supabase.from('applications').update({ status: 'sparked' }).eq('id', app.id)
    setApplicants(prev => prev.map(a => a.id === app.id ? {...a, status:'sparked'} : a))
  }

  function passCandidate(appId) {
    setApplicants(prev => prev.filter(a => a.id !== appId))
  }

  const COLORS = ['#4F46E5','#7C3AED','#059669','#DC2626','#E8832A','#0891B2']

  return (
    <>
      <div className="status-bar" style={{ background:'var(--bg2)' }}><span>9:41</span><div className="status-icons"><i className="ti ti-wifi"/><i className="ti ti-battery-2"/></div></div>
      <div className="page-header">
        <button onClick={() => nav('/employer')} style={{ background:'none', border:'none', cursor:'pointer' }}><i className="ti ti-arrow-left" style={{ fontSize:18, color:'var(--t2)' }}/></button>
        <h1>{job?.title || 'Shortlist'}</h1>
      </div>
      <div style={{ background:'var(--bg2)', padding:'7px 14px', borderBottom:'0.5px solid var(--border)', flexShrink:0, display:'flex', gap:8, alignItems:'center' }}>
        <span style={{ fontSize:11, color:'var(--t2)' }}>{applicants.length} applicants</span>
        <div style={{ width:1, height:10, background:'var(--border)' }}/>
        <span style={{ fontSize:11, color:'var(--green)' }}>{applicants.filter(a=>a.status==='sparked').length} sparked</span>
        <span style={{ marginLeft:'auto', fontSize:10, color:'var(--t3)' }}>By application date ↓</span>
      </div>

      <div className="scroll" style={{ background:'var(--bg)' }}>
        {loading && <div style={{ padding:24, textAlign:'center', color:'var(--t3)' }}><i className="ti ti-loader spin"/></div>}
        {!loading && applicants.length === 0 && (
          <div style={{ padding:32, textAlign:'center', color:'var(--t3)', fontSize:13 }}>No applicants yet. Share your role to attract candidates.</div>
        )}
        {applicants.map((app, i) => {
          const p = app.profiles
          const sparked = app.status === 'sparked'
          return (
            <div key={app.id} style={{ background:'var(--bg2)', border:`0.5px solid ${sparked ? 'var(--gb)' : 'var(--border)'}`, borderRadius:12, margin:'8px 14px 0', overflow:'hidden', opacity: sparked ? .7 : 1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:11, padding:12 }}>
                <div style={{ width:42, height:42, borderRadius:'50%', background: COLORS[i%COLORS.length], display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, fontWeight:500, color:'#fff', flexShrink:0 }}>
                  {(p?.full_name || 'U').split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:500, color:'#fff' }}>{p?.full_name || 'Candidate'}</div>
                  <div style={{ fontSize:10, color:'var(--t2)' }}>{p?.job_title || p?.profession} · {p?.location_name}</div>
                </div>
                <div style={{ fontSize:13, fontWeight:500, color:'var(--spark)' }}>
                  {Math.floor(65 + Math.random()*30)}%
                </div>
              </div>
              <div style={{ padding:'0 12px 12px' }}>
                {p?.skills && (
                  <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginBottom:7 }}>
                    {p.skills.split(',').slice(0,4).map(s => <span key={s} style={{ background:'var(--bg4)', border:'0.5px solid var(--border)', borderRadius:99, padding:'2px 8px', fontSize:10, color:'var(--t2)' }}>{s.trim()}</span>)}
                  </div>
                )}
                {p?.current_employer && <div style={{ fontSize:11, color:'var(--t2)', marginBottom:7 }}>Currently at {p.current_employer}</div>}
                {sparked ? (
                  <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'var(--green)' }}><i className="ti ti-flame" style={{ fontSize:13 }}/>Sparked — chat is open</div>
                ) : (
                  <div style={{ display:'flex', gap:6 }}>
                    <button style={{ flex:1, padding:8, borderRadius:8, border:'0.5px solid var(--border)', background:'var(--bg4)', fontSize:11, fontWeight:500, fontFamily:'inherit', cursor:'pointer', color:'var(--t2)', display:'flex', alignItems:'center', justifyContent:'center', gap:4 }} onClick={() => passCandidate(app.id)}>
                      <i className="ti ti-x"/>Pass
                    </button>
                    <button style={{ flex:1, padding:8, borderRadius:8, border:'none', background:'var(--spark)', fontSize:11, fontWeight:500, fontFamily:'inherit', cursor:'pointer', color:'#000', display:'flex', alignItems:'center', justifyContent:'center', gap:4 }} onClick={() => sparkCandidate(app)}>
                      <i className="ti ti-flame"/>Spark
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
        <div style={{ height:12 }}/>
      </div>
      <EmpNav/>
    </>
  )
}
