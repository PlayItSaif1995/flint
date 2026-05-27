import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import CandNav from '../../components/CandNav'

export default function CandProfile() {
  const nav = useNavigate()
  const { profile, user } = useAuth()
  const [stats, setStats] = useState({ applied: 0, sparks: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadStats() }, [])

  async function loadStats() {
    const [{ count: applied }, { count: sparks }] = await Promise.all([
      supabase.from('applications').select('*', { count:'exact', head:true }).eq('candidate_id', user.id),
      supabase.from('matches').select('*', { count:'exact', head:true }).eq('candidate_id', user.id).neq('status', 'unmatched')
    ])
    setStats({ applied: applied || 0, sparks: sparks || 0 })
    setLoading(false)
  }

  return (
    <>
      <div className="status-bar" style={{ background:'var(--bg2)' }}><span>9:41</span><div className="status-icons"><i className="ti ti-wifi"/><i className="ti ti-battery-2"/></div></div>
      <div className="page-header">
        <h1>My profile</h1>
        <button onClick={() => nav('/settings')} style={{ background:'none', border:'none', cursor:'pointer' }}>
          <i className="ti ti-settings" style={{ fontSize:18, color:'var(--t2)' }}/>
        </button>
      </div>
      <div className="scroll" style={{ background:'var(--bg)' }}>

        {/* Avatar */}
        <div style={{ width:'100%', height:130, background:'var(--bg3)', position:'relative', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <div style={{ width:72, height:72, borderRadius:'50%', background:'var(--spark)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, fontWeight:500, color:'#000' }}>
            {(profile?.full_name || 'U').split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase()}
          </div>
          <button onClick={() => nav('/settings/edit-profile')} style={{ position:'absolute', bottom:9, right:9, background:'var(--spark)', border:'none', borderRadius:8, padding:'7px 12px', color:'#000', fontSize:11, fontWeight:500, fontFamily:'inherit', cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
            <i className="ti ti-edit"/>Edit profile
          </button>
        </div>

        {/* Name & title */}
        <div style={{ padding:'12px 15px 0' }}>
          <div style={{ fontSize:19, fontWeight:500, color:'#fff', marginBottom:2 }}>{profile?.full_name || 'Your name'}</div>
          <div style={{ fontSize:12, color:'var(--spark)', marginBottom:4, display:'flex', alignItems:'center', gap:4 }}>
            <i className="ti ti-briefcase" style={{ fontSize:12 }}/>{profile?.job_title || profile?.profession || 'Add your profession'}
          </div>
          {profile?.location_name && (
            <div style={{ fontSize:11, color:'var(--t2)', marginBottom:10, display:'flex', alignItems:'center', gap:4 }}>
              <i className="ti ti-map-pin" style={{ fontSize:11 }}/>{profile.location_name}
            </div>
          )}

          {/* Real stats */}
          <div style={{ display:'flex', gap:7, marginBottom:12 }}>
            {[
              [stats.applied, 'Applied'],
              [stats.sparks, 'Sparks'],
              [profile?.work_style || 'Any', 'Work style'],
              [profile?.min_salary || '—', 'Min salary'],
            ].map(([n, l]) => (
              <div key={l} style={{ flex:1, background:'var(--bg3)', border:'0.5px solid var(--border)', borderRadius:9, padding:'8px 6px', textAlign:'center' }}>
                <div style={{ fontSize:14, fontWeight:500, color: l==='Sparks' && n > 0 ? 'var(--spark)' : '#fff', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{n}</div>
                <div style={{ fontSize:9, color:'var(--t3)' }}>{l}</div>
              </div>
            ))}
          </div>

          {/* Bio */}
          {profile?.bio ? (
            <>
              <div className="sec-label">ABOUT ME</div>
              <div style={{ fontSize:12, color:'var(--t2)', lineHeight:1.6, marginBottom:12 }}>{profile.bio}</div>
            </>
          ) : (
            <div onClick={() => nav('/settings/edit-profile')} style={{ background:'var(--bg2)', border:'0.5px dashed var(--border2)', borderRadius:10, padding:'11px 13px', marginBottom:12, cursor:'pointer', display:'flex', alignItems:'center', gap:8 }}>
              <i className="ti ti-plus" style={{ fontSize:14, color:'var(--t3)' }}/>
              <span style={{ fontSize:12, color:'var(--t3)' }}>Add a bio</span>
            </div>
          )}

          {/* Skills */}
          {profile?.skills ? (
            <>
              <div className="sec-label">SKILLS</div>
              <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:12 }}>
                {profile.skills.split(',').map(s => (
                  <span key={s} style={{ background:'var(--bg3)', border:'0.5px solid var(--border)', borderRadius:7, padding:'4px 8px', fontSize:10, color:'var(--t2)' }}>{s.trim()}</span>
                ))}
              </div>
            </>
          ) : (
            <div onClick={() => nav('/settings/edit-profile')} style={{ background:'var(--bg2)', border:'0.5px dashed var(--border2)', borderRadius:10, padding:'11px 13px', marginBottom:12, cursor:'pointer', display:'flex', alignItems:'center', gap:8 }}>
              <i className="ti ti-plus" style={{ fontSize:14, color:'var(--t3)' }}/>
              <span style={{ fontSize:12, color:'var(--t3)' }}>Add skills</span>
            </div>
          )}

          {/* Experience */}
          {(profile?.profession || profile?.seniority) && (
            <>
              <div className="sec-label">EXPERIENCE</div>
              <div style={{ background:'var(--bg2)', border:'0.5px solid var(--border)', borderRadius:10, padding:'11px 13px', marginBottom:12 }}>
                <div style={{ fontSize:13, fontWeight:500, color:'#fff', marginBottom:2 }}>{profile?.job_title || profile?.profession}</div>
                {profile?.current_employer && <div style={{ fontSize:11, color:'var(--t2)', marginBottom:2 }}>at {profile.current_employer}</div>}
                {profile?.seniority && <div style={{ fontSize:11, color:'var(--t3)' }}>{profile.seniority}</div>}
                {profile?.qualification && <div style={{ fontSize:11, color:'var(--t3)', marginTop:4 }}><i className="ti ti-school" style={{ fontSize:11 }}/> {profile.qualification}</div>}
              </div>
            </>
          )}

          {/* Pro teaser */}
          <div onClick={() => nav('/premium')} style={{ background:'linear-gradient(135deg,#1a0a00,var(--bg2))', border:'0.5px solid var(--sb)', borderRadius:11, padding:11, marginBottom:14, display:'flex', gap:8, alignItems:'center', cursor:'pointer' }}>
            <div style={{ width:30, height:30, background:'var(--spark)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <i className="ti ti-crown" style={{ fontSize:14, color:'#000' }}/>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:12, fontWeight:500, color:'#fff' }}>Upgrade to Flint Pro</div>
              <div style={{ fontSize:10, color:'var(--spark)' }}>See who viewed you, priority placement + more</div>
            </div>
            <i className="ti ti-arrow-right" style={{ fontSize:14, color:'var(--spark)' }}/>
          </div>
        </div>
        <div style={{ height:14 }}/>
      </div>
      <CandNav/>
    </>
  )
}
