import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import EmpNav from '../../components/EmpNav'

const PROFESSIONS = ['Any profession','Civil Engineer','Structural Engineer','Mechanical Engineer','Electrical Engineer','Software Engineer','Architect','Town Planner','Quantity Surveyor','Project Manager','Solicitor','Accountant','Doctor','Nurse','Data Scientist','UX Designer','Product Manager','Other']
const SENIORITY = ['Any seniority','Junior / Graduate','Mid-level','Senior','Lead / Principal','Director']
const AVAILABILITY = ['Any availability','Immediate start','Within 1 month','Within 2 months','Within 3 months']
const WORK_STYLE = ['Any style','Remote','Hybrid','On-site']

export default function Headhunt() {
  const nav = useNavigate()
  const { user } = useAuth()
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [sparkedIds, setSparkedIds] = useState([])
  const [showModal, setShowModal] = useState(null)
  const [search, setSearch] = useState('')
  const [profession, setProfession] = useState('Any profession')
  const [seniority, setSeniority] = useState('Any seniority')
  const [availability, setAvailability] = useState('Any availability')
  const [workStyle, setWorkStyle] = useState('Any style')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => { loadCandidates() }, [])

  async function loadCandidates() {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'candidate')
      .eq('onboarded', true)
      .neq('open_to_work', false)
      .limit(50)
    setCandidates(data || [])
    const { data: existing } = await supabase.from('matches').select('candidate_id').eq('employer_id', user.id).eq('headhunt', true)
    setSparkedIds((existing || []).map(m => m.candidate_id))
    setLoading(false)
  }

  function getMatchScore(candidateId) {
    const hash = (candidateId || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0)
    return 70 + (hash % 25)
  }

  const filtered = candidates.filter(c => {
    if (search) {
      const q = search.toLowerCase()
      if (!(c.profession||'').toLowerCase().includes(q) && !(c.job_title||'').toLowerCase().includes(q) && !(c.skills||'').toLowerCase().includes(q)) return false
    }
    if (profession !== 'Any profession' && c.profession !== profession) return false
    if (seniority !== 'Any seniority' && !(c.seniority||'').includes(seniority.split(' ')[0])) return false
    if (workStyle !== 'Any style' && c.work_style !== workStyle) return false
    return true
  })

  const activeFilters = [profession, seniority, availability, workStyle].filter(f => !f.startsWith('Any')).length

  async function sendHeadhuntSpark(candidate) {
    const { data: company } = await supabase.from('companies').select('id').eq('owner_id', user.id).maybeSingle()
    const { data: existing } = await supabase.from('matches')
      .select('id').eq('candidate_id', candidate.id).eq('employer_id', user.id).eq('headhunt', true).maybeSingle()
    if (!existing) {
      await supabase.from('matches').insert({ 
        candidate_id: candidate.id, employer_id: user.id, company_id: company?.id, 
        status: 'headhunt', candidate_read: false, employer_read: true, 
        headhunt: true, last_message_at: new Date().toISOString() 
      })
    }
    setSparkedIds(prev => [...prev, candidate.id])
    setShowModal(null)
  }

  const COLORS = ['#E8832A','#7C3AED','#059669','#DC2626','#0891B2','#4F46E5']

  return (
    <>
      <div className="status-bar" style={{ background:'var(--bg2)' }}><span>9:41</span><div className="status-icons"><i className="ti ti-wifi"/><i className="ti ti-battery-2"/></div></div>
      <div className="page-header">
        <h1>Headhunt</h1>
        <div style={{ background:'var(--purple)', borderRadius:6, padding:'3px 8px', fontSize:10, fontWeight:600, color:'#fff' }}>Teams</div>
      </div>

      {/* Search bar */}
      <div style={{ padding:'10px 14px 8px', background:'var(--bg)', borderBottom:'0.5px solid var(--border)', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', background:'var(--bg3)', border:'0.5px solid var(--border)', borderRadius:10, padding:'9px 12px', gap:7, marginBottom:8 }}>
          <i className="ti ti-search" style={{ fontSize:14, color:'var(--t3)' }}/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by job title, skill or profession..." style={{ background:'none', border:'none', outline:'none', color:'#fff', fontSize:12, fontFamily:'inherit', flex:1 }}/>
          {search && <button onClick={() => setSearch('')} style={{ background:'none', border:'none', cursor:'pointer' }}><i className="ti ti-x" style={{ fontSize:13, color:'var(--t3)' }}/></button>}
        </div>
        <button onClick={() => setShowFilters(!showFilters)} style={{ display:'flex', alignItems:'center', gap:5, background: activeFilters > 0 ? 'var(--pd)' : 'var(--bg3)', border:`0.5px solid ${activeFilters > 0 ? 'var(--pb)' : 'var(--border)'}`, borderRadius:8, padding:'6px 11px', cursor:'pointer', fontFamily:'inherit' }}>
          <i className="ti ti-adjustments-horizontal" style={{ fontSize:13, color: activeFilters > 0 ? 'var(--purple)' : 'var(--t2)' }}/>
          <span style={{ fontSize:11, color: activeFilters > 0 ? 'var(--purple)' : 'var(--t2)', fontWeight: activeFilters > 0 ? 600 : 400 }}>Filters{activeFilters > 0 ? ` (${activeFilters} active)` : ''}</span>
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div style={{ background:'var(--bg2)', borderBottom:'0.5px solid var(--border)', padding:'12px 14px', flexShrink:0 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {[
              ['Profession', profession, setProfession, PROFESSIONS],
              ['Seniority', seniority, setSeniority, SENIORITY],
              ['Availability', availability, setAvailability, AVAILABILITY],
              ['Work style', workStyle, setWorkStyle, WORK_STYLE],
            ].map(([label, val, setter, opts]) => (
              <div key={label}>
                <div style={{ fontSize:9, color:'var(--t3)', letterSpacing:'.5px', marginBottom:4 }}>{label.toUpperCase()}</div>
                <select value={val} onChange={e => setter(e.target.value)} style={{ width:'100%', background:'var(--bg3)', border:'0.5px solid var(--border)', borderRadius:8, padding:'7px 10px', color: val.startsWith('Any') ? 'var(--t2)' : '#fff', fontSize:11, fontFamily:'inherit', outline:'none', cursor:'pointer' }}>
                  {opts.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
          {activeFilters > 0 && (
            <button onClick={() => { setProfession('Any profession'); setSeniority('Any seniority'); setAvailability('Any availability'); setWorkStyle('Any style') }}
              style={{ marginTop:8, fontSize:11, color:'var(--red)', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit' }}>
              Clear all filters
            </button>
          )}
        </div>
      )}

      <div style={{ padding:'7px 14px 4px', flexShrink:0, background:'var(--bg)' }}>
        <div style={{ fontSize:10, color:'var(--t3)' }}>{filtered.length} CANDIDATES FOUND</div>
      </div>

      <div className="scroll" style={{ background:'var(--bg)' }}>
        {loading && <div style={{ padding:24, textAlign:'center', color:'var(--t3)' }}><i className="ti ti-loader spin"/></div>}
        {!loading && filtered.length === 0 && (
          <div style={{ padding:32, textAlign:'center' }}>
            <i className="ti ti-user-off" style={{ fontSize:32, color:'var(--t3)', display:'block', marginBottom:12 }}/>
            <div style={{ fontSize:13, color:'var(--t3)' }}>No candidates match your filters</div>
            <button onClick={() => { setProfession('Any profession'); setSeniority('Any seniority'); setAvailability('Any availability'); setWorkStyle('Any style'); setSearch('') }}
              style={{ marginTop:10, fontSize:12, color:'var(--spark)', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit' }}>Clear filters</button>
          </div>
        )}

        {filtered.slice(0,2).map((c, i) => {
          const sparked = sparkedIds.includes(c.id)
          return (
            <div key={c.id} style={{ background:'var(--bg2)', border:'0.5px solid var(--border)', borderRadius:13, margin:'8px 14px 0', padding:13 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:9 }}>
                <div style={{ width:44, height:44, borderRadius:'50%', background: COLORS[i%COLORS.length], display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:500, color:'#fff', flexShrink:0, position:'relative' }}>
                  {(c.full_name||'U').split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}
                  <div style={{ position:'absolute', bottom:-2, right:-2, width:16, height:16, background:'var(--bg)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid var(--border)' }}>
                    <i className="ti ti-lock" style={{ fontSize:9, color:'var(--t3)' }}/>
                  </div>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:500, color:'#fff' }}>{(c.full_name||'').split(' ')[0]} {(c.full_name||'').split(' ').slice(-1)[0]?.[0]}.</div>
                  <div style={{ fontSize:11, color:'var(--spark)' }}>{c.job_title || c.profession} · {c.location_name || 'Location not set'}</div>
                </div>
                <div style={{ fontSize:13, fontWeight:500, color:'var(--spark)' }}>{getMatchScore(c.id)}%</div>
              </div>
              {c.seniority && <div style={{ fontSize:10, color:'var(--t2)', marginBottom:6 }}>{c.seniority}</div>}
              {c.skills && <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginBottom:7 }}>{c.skills.split(',').slice(0,4).map(s=><span key={s} style={{ background:'var(--bg4)', border:'0.5px solid var(--border)', borderRadius:99, padding:'2px 8px', fontSize:10, color:'var(--t2)' }}>{s.trim()}</span>)}</div>}
              <div style={{ background:'var(--sd)', border:'0.5px solid var(--sb)', borderRadius:8, padding:'7px 10px', marginBottom:8, fontSize:10, color:'var(--spark)', display:'flex', alignItems:'center', gap:5 }}>
                <i className="ti ti-shield" style={{ fontSize:12, flexShrink:0 }}/>Name & contact hidden until spark accepted
              </div>
              {sparked ? (
                <div style={{ fontSize:11, color:'var(--purple)', display:'flex', alignItems:'center', gap:5 }}><i className="ti ti-check" style={{ fontSize:13 }}/>Headhunt spark sent — awaiting response</div>
              ) : (
                <div style={{ display:'flex', gap:6 }}>
                  <button className="btn-sm secondary" style={{ flex:1, justifyContent:'center' }}><i className="ti ti-eye"/>View profile</button>
                  <button className="btn-sm purple" style={{ flex:1, justifyContent:'center' }} onClick={() => setShowModal(c)}><i className="ti ti-flame"/>Headhunt spark</button>
                </div>
              )}
            </div>
          )
        })}

        {filtered.length > 2 && (
          <div style={{ margin:'8px 14px 0', background:'var(--bg2)', border:'0.5px solid var(--pb)', borderRadius:13, padding:13, position:'relative', overflow:'hidden', minHeight:100 }}>
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom,transparent 20%,var(--bg2))', zIndex:2, display:'flex', alignItems:'flex-end', justifyContent:'center', paddingBottom:14 }}>
              <div onClick={() => nav('/employer/premium')} style={{ background:'var(--purple)', borderRadius:8, padding:'8px 16px', fontSize:11, fontWeight:600, color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}>
                <i className="ti ti-lock" style={{ fontSize:11 }}/>Unlock {filtered.length-2} more candidates with Teams
              </div>
            </div>
            <div style={{ filter:'blur(4px)', pointerEvents:'none' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                <div style={{ width:44, height:44, borderRadius:'50%', background:'#DC2626', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:500, color:'#fff' }}>JK</div>
                <div><div style={{ fontSize:14, fontWeight:500, color:'#fff' }}>James K.</div><div style={{ fontSize:11, color:'var(--spark)' }}>Principal Engineer · Manchester</div></div>
              </div>
            </div>
          </div>
        )}
        <div style={{ height:12 }}/>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Send a headhunt spark?</div>
            <div className="modal-sub">You're sparking this candidate anonymously. Their identity and yours stay hidden until they accept.</div>
            <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
              <button className="btn-primary" style={{ marginBottom:0 }} onClick={() => sendHeadhuntSpark(showModal)}><i className="ti ti-flame"/>Send headhunt spark</button>
              <button className="btn-secondary" onClick={() => setShowModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      <EmpNav/>
    </>
  )
}
