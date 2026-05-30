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
  const [expanded, setExpanded] = useState(null)

  useEffect(() => { loadData() }, [jobId])

  async function loadData() {
    const { data: jobData } = await supabase.from('jobs').select('*, companies(name)').eq('id', jobId).single()
    const { data: apps, error } = await supabase
      .from('applications')
      .select('id, candidate_id, status, created_at')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false })
    if (error) console.error('Shortlist load error:', error)

    const appsWithProfiles = await Promise.all((apps || []).map(async app => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, job_title, profession, seniority, current_employer, qualification, skills, location_name, bio, cv_path, cv_filename, avatar_url, open_to_work')
        .eq('id', app.candidate_id)
        .maybeSingle()
      return { ...app, profiles: profile }
    }))

    setJob(jobData)
    setApplicants(appsWithProfiles)
    setLoading(false)
  }

  async function sparkCandidate(app) {
    let companyId = null
    const { data: company } = await supabase.from('companies').select('id').eq('owner_id', user.id).maybeSingle()
    companyId = company?.id
    if (!companyId) return

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

  function fitScore(p) {
    if (!p) return 70
    let score = 60
    if (p.skills) score += 10
    if (p.bio) score += 5
    if (p.cv_path) score += 10
    if (p.qualification) score += 8
    if (p.seniority) score += 7
    return Math.min(score, 99)
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
      </div>

      <div className="scroll" style={{ background:'var(--bg)' }}>
        {loading && <div style={{ padding:24, textAlign:'center', color:'var(--t3)' }}><i className="ti ti-loader spin"/></div>}
        {!loading && applicants.length === 0 && (
          <div style={{ padding:32, textAlign:'center', color:'var(--t3)', fontSize:13 }}>No applicants yet.</div>
        )}
        {applicants.map((app, i) => {
          const p = app.profiles
          const sparked = app.status === 'sparked'
          const isExpanded = expanded === app.id
          const score = fitScore(p)

          return (
            <div key={app.id} style={{ background:'var(--bg2)', border:`0.5px solid ${sparked ? 'var(--gb)' : 'var(--border)'}`, borderRadius:14, margin:'8px 14px 0', overflow:'hidden' }}>
              
              {/* Header row */}
              <div style={{ display:'flex', alignItems:'center', gap:11, padding:12, cursor:'pointer' }} onClick={() => setExpanded(isExpanded ? null : app.id)}>
                <div style={{ width:44, height:44, borderRadius:'50%', background: COLORS[i%COLORS.length], display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, fontWeight:500, color:'#fff', flexShrink:0, overflow:'hidden' }}>
                  {p?.avatar_url
                    ? <img src={p.avatar_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                    : (p?.full_name || 'U').split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()
                  }
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:500, color:'#fff' }}>{p?.full_name || 'Candidate'}</div>
                  <div style={{ fontSize:11, color:'var(--t2)' }}>
                    {p?.job_title || p?.profession || 'No title'}
                    {p?.location_name ? ` · ${p.location_name}` : ''}
                  </div>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <div style={{ fontSize:15, fontWeight:600, color:'var(--spark)' }}>{score}%</div>
                  <div style={{ fontSize:9, color:'var(--t3)' }}>fit score</div>
                </div>
                <i className={`ti ti-chevron-${isExpanded ? 'up' : 'down'}`} style={{ fontSize:13, color:'var(--t3)', flexShrink:0 }}/>
              </div>

              {/* Expanded profile */}
              {isExpanded && (
                <div style={{ borderTop:'0.5px solid var(--border)', padding:'12px 12px 14px' }}>
                  
                  {/* Quick stats */}
                  <div style={{ display:'flex', gap:6, marginBottom:12 }}>
                    {[
                      [p?.seniority?.split(' ')[0] || '—', 'Seniority'],
                      [p?.current_employer || '—', 'Employer'],
                      [p?.qualification ? p.qualification.split(' ')[0] : '—', 'Qualification'],
                    ].map(([val, label]) => (
                      <div key={label} style={{ flex:1, background:'var(--bg3)', borderRadius:8, padding:'7px 8px', textAlign:'center' }}>
                        <div style={{ fontSize:11, fontWeight:500, color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{val}</div>
                        <div style={{ fontSize:9, color:'var(--t3)' }}>{label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Bio */}
                  {p?.bio && (
                    <div style={{ marginBottom:10 }}>
                      <div style={{ fontSize:9, color:'var(--t3)', letterSpacing:'.5px', marginBottom:4 }}>BIO</div>
                      <div style={{ fontSize:12, color:'var(--t2)', lineHeight:1.6 }}>{p.bio}</div>
                    </div>
                  )}

                  {/* Skills */}
                  {p?.skills && (
                    <div style={{ marginBottom:10 }}>
                      <div style={{ fontSize:9, color:'var(--t3)', letterSpacing:'.5px', marginBottom:5 }}>SKILLS</div>
                      <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                        {p.skills.split(',').map(s => (
                          <span key={s} style={{ background:'var(--bg4)', border:'0.5px solid var(--border)', borderRadius:99, padding:'3px 9px', fontSize:10, color:'var(--t2)' }}>{s.trim()}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CV */}
                  {p?.cv_path && (
                    <div style={{ marginBottom:12 }}>
                      <div style={{ fontSize:9, color:'var(--t3)', letterSpacing:'.5px', marginBottom:5 }}>CV</div>
                      <button onClick={async () => {
                        const { data } = supabase.storage.from('cvs').getPublicUrl(p.cv_path)
                        window.open(data.publicUrl, '_blank')
                      }} style={{ background:'var(--gd)', border:'0.5px solid var(--gb)', borderRadius:8, padding:'7px 12px', color:'var(--green)', fontSize:12, fontFamily:'inherit', cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
                        <i className="ti ti-file-cv" style={{ fontSize:14 }}/>{p.cv_filename || 'View CV'}
                      </button>
                    </div>
                  )}

                  {/* Actions */}
                  {sparked ? (
                    <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'var(--green)', background:'var(--gd)', border:'0.5px solid var(--gb)', borderRadius:8, padding:'8px 12px' }}>
                      <i className="ti ti-flame" style={{ fontSize:14 }}/>Sparked — chat is open
                    </div>
                  ) : (
                    <div style={{ display:'flex', gap:7 }}>
                      <button style={{ flex:1, padding:'9px 0', borderRadius:9, border:'0.5px solid var(--border)', background:'var(--bg4)', fontSize:12, fontWeight:500, fontFamily:'inherit', cursor:'pointer', color:'var(--t2)', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }} onClick={() => passCandidate(app.id)}>
                        <i className="ti ti-x"/>Pass
                      </button>
                      <button style={{ flex:2, padding:'9px 0', borderRadius:9, border:'none', background:'var(--spark)', fontSize:12, fontWeight:600, fontFamily:'inherit', cursor:'pointer', color:'#000', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }} onClick={() => sparkCandidate(app)}>
                        <i className="ti ti-flame"/>Spark this candidate
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
        <div style={{ height:14 }}/>
      </div>
      <EmpNav/>
    </>
  )
}
