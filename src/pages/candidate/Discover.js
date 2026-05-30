import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import CandNav from '../../components/CandNav'

function haversine(lat1, lon1, lat2, lon2) {
  const R = 3959 // miles
  const dLat = (lat2-lat1)*Math.PI/180
  const dLon = (lon2-lon1)*Math.PI/180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2
  return Math.round(R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a)))
}

function getRadiusMiles(radiusStr) {
  if (!radiusStr) return 9999
  if (radiusStr.includes('Anywhere')) return 9999
  const match = radiusStr.match(/(\d+)/)
  return match ? parseInt(match[1]) : 9999
}

function fitScore(profile, job) {
  let score = 60
  if (profile.profession && job.profession_tags && job.profession_tags.includes(profile.profession)) score += 15
  if (profile.seniority && job.seniority_level && job.seniority_level.includes(profile.seniority?.split(' ')[0])) score += 10
  if (profile.work_style && job.work_style === profile.work_style) score += 10
  if (profile.min_salary && job.salary_min) {
    const ps = parseInt(profile.min_salary.replace(/[^0-9]/g,'')) * 1000
    if (job.salary_max >= ps) score += 5
  }
  return Math.min(score, 99)
}

export default function Discover() {
  const nav = useNavigate()
  const { user, profile } = useAuth()
  const [jobs, setJobs] = useState([])
  const [idx, setIdx] = useState(0)
  const [swiping, setSwiping] = useState(null)
  const [toast, setToast] = useState(null)
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadJobs(); loadUnread() }, [])

  async function loadJobs() {
    const { data } = await supabase.from('jobs').select('*, companies(name, location)').eq('status', 'active').limit(100)
    const passed = JSON.parse(localStorage.getItem(`passed_${user.id}`) || '[]')
    const applied = JSON.parse(localStorage.getItem(`applied_${user.id}`) || '[]')
    
    const radiusMiles = getRadiusMiles(profile?.search_radius)
    const userLat = profile?.lat
    const userLon = profile?.lon

    const filtered = (data || []).filter(j => {
      // Skip already passed or applied
      if (passed.includes(j.id) || applied.includes(j.id)) return false
      // If user has no location or job has no location or radius is anywhere — show all
      if (!userLat || !userLon || !j.lat || !j.lon || radiusMiles >= 9999) return true
      // Filter by distance
      const dist = haversine(userLat, userLon, j.lat, j.lon)
      return dist <= radiusMiles
    })

    // Sort by fit score
    filtered.sort((a, b) => fitScore(profile, b) - fitScore(profile, a))
    setJobs(filtered)
    setLoading(false)
  }

  async function loadUnread() {
    const { count } = await supabase.from('matches').select('*', { count:'exact', head:true }).eq('candidate_id', user.id).eq('candidate_read', false)
    setUnread(count || 0)
  }

  function showToast(msg, icon, color) {
    setToast({ msg, icon, color })
    setTimeout(() => setToast(null), 2800)
  }

  function doPass() {
    if (!jobs[idx]) return
    const passed = JSON.parse(localStorage.getItem(`passed_${user.id}`) || '[]')
    passed.push(jobs[idx].id)
    localStorage.setItem(`passed_${user.id}`, JSON.stringify(passed))
    setSwiping('left')
    setTimeout(() => { setSwiping(null); setIdx(i => i+1) }, 350)
    showToast('Passed on this role', 'ti-x', 'var(--t2)')
  }

  async function doApply() {
    if (!jobs[idx]) return
    const job = jobs[idx]
    const applied = JSON.parse(localStorage.getItem(`applied_${user.id}`) || '[]')
    if (applied.includes(job.id)) {
      showToast('Already applied!', 'ti-info-circle', 'var(--t2)')
      return
    }
    applied.push(job.id)
    localStorage.setItem(`applied_${user.id}`, JSON.stringify(applied))
    const { error } = await supabase.from('applications').insert({ 
      candidate_id: user.id, 
      job_id: job.id, 
      status: 'pending' 
    })
    if (error) {
      console.error('Apply error:', error)
      showToast('Failed to apply. Try again.', 'ti-x', 'var(--red)')
      return
    }
    setSwiping('right')
    showToast('Applied! 🔥', 'ti-flame', 'var(--spark)')
    setTimeout(() => { setSwiping(null); setIdx(i => i+1) }, 350)
  }

  function doSave() {
    showToast('Saved to your list', 'ti-bookmark', 'var(--spark)')
  }

  function doUndo() {
    if (idx === 0) return
    const passed = JSON.parse(localStorage.getItem(`passed_${user.id}`) || '[]')
    passed.pop()
    localStorage.setItem(`passed_${user.id}`, JSON.stringify(passed))
    setIdx(i => Math.max(0, i-1))
  }

  const job = jobs[idx]
  const nextJob = jobs[idx+1]
  const nnJob = jobs[idx+2]
  const dist = job && profile?.lat && job.lat ? haversine(profile.lat, profile.lon, job.lat, job.lon) : null
  const score = job && profile ? fitScore(profile, job) : 85

  if (loading) return (
    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', flexDirection:'column', gap:12 }}>
      <i className="ti ti-loader spin" style={{ fontSize:28, color:'var(--spark)' }}/>
      <p style={{ color:'var(--t2)', fontSize:14 }}>Finding roles near you...</p>
    </div>
  )

  return (
    <>
      <div className="status-bar" style={{ background:'var(--bg)' }}><span>9:41</span><div className="status-icons"><i className="ti ti-wifi"/><i className="ti ti-battery-2"/></div></div>

      {/* Header */}
      <div style={{ background:'var(--bg)', padding:'7px 16px 9px', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div className="logo-icon" style={{ width:28, height:28 }}>
            <svg viewBox="0 0 32 32" fill="none" width={17} height={17}><path d="M19 3L10 17H16L13 29L24 13H17.5L19 3Z" fill="white" opacity="0.95"/></svg>
          </div>
          <span className="logo-text" style={{ fontSize:18 }}>flint<span>.</span></span>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={() => nav('/settings')} style={{ background:'var(--bg3)', border:'0.5px solid var(--border)', borderRadius:8, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <i className="ti ti-settings" style={{ fontSize:16, color:'var(--t2)' }}/>
          </button>
          <button onClick={() => nav('/notifications')} style={{ background:'var(--bg3)', border:'0.5px solid var(--border)', borderRadius:8, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <i className="ti ti-bell" style={{ fontSize:16, color:'var(--t2)' }}/>
          </button>
        </div>
      </div>

      {/* Location pill */}
      <div style={{ padding:'4px 14px 8px', background:'var(--bg)', flexShrink:0 }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:5, background:'var(--bg3)', border:'0.5px solid var(--border)', borderRadius:99, padding:'4px 10px' }}>
          <i className="ti ti-map-pin" style={{ fontSize:11, color:'var(--spark)' }}/>
          <span style={{ fontSize:11, color:'var(--t2)' }}>{profile?.location_name || 'Your location'}</span>
          <span style={{ fontSize:11, color:'var(--t3)' }}>· {profile?.search_radius?.split(' ')[1] || '25'}mi</span>
        </div>
      </div>

      {/* Card area */}
      <div style={{ flex:1, position:'relative', overflow:'hidden', padding:'7px 12px 0' }}>
        {toast && (
          <div className="toast">
            <i className={`ti ${toast.icon}`} style={{ color: toast.color }}/>
            <span>{toast.msg}</span>
          </div>
        )}

        {!job && (
          <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12, color:'var(--t2)', fontSize:14 }}>
            <i className="ti ti-check" style={{ fontSize:32, color:'var(--spark)' }}/>
            <div style={{ fontWeight:500, color:'#fff' }}>You're all caught up!</div>
            <div style={{ fontSize:12, color:'var(--t3)' }}>Check back soon for new roles</div>
          </div>
        )}

        {/* Background cards */}
        {nnJob && <div style={{ position:'absolute', top:7, left:12, right:12, bottom:0, background:'var(--bg2)', borderRadius:19, border:'0.5px solid var(--border)', transform:'translateY(18px) scale(0.92)', zIndex:1, pointerEvents:'none' }}/>}
        {nextJob && <div style={{ position:'absolute', top:7, left:12, right:12, bottom:0, background:'var(--bg2)', borderRadius:19, border:'0.5px solid var(--border)', transform:'translateY(9px) scale(0.96)', zIndex:2, pointerEvents:'none' }}/>}

        {/* Main card */}
        {job && (
          <div style={{ position:'absolute', top:7, left:12, right:12, bottom:0, background:'var(--bg2)', borderRadius:19, border:'0.5px solid var(--border)', overflowY:'auto', zIndex:3, transform: swiping==='left' ? 'translateX(-120%) rotate(-18deg)' : swiping==='right' ? 'translateX(120%) rotate(18deg)' : 'none', opacity: swiping ? 0 : 1, transition:'transform .35s cubic-bezier(.4,0,.2,1), opacity .35s' }}>
            <div style={{ padding:'13px 14px 11px', display:'flex', alignItems:'center', gap:11, borderBottom:'0.5px solid var(--border)' }}>
              <div style={{ width:46, height:46, borderRadius:11, background:'#4F46E5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, fontWeight:700, color:'#fff', flexShrink:0 }}>
                {(job.companies?.name || job.company_name || 'CO').substring(0,2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize:10, color:'var(--t2)', marginBottom:2 }}>{job.companies?.name || job.company_name}</div>
                <div style={{ fontSize:15, fontWeight:500, color:'#fff' }}>{job.title}</div>
              </div>
            </div>
            <div style={{ padding:'12px 14px' }}>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:10 }}>
                {job.salary_min && <div style={{ background:'var(--sd)', border:'0.5px solid var(--sb)', borderRadius:99, padding:'4px 9px', fontSize:10, color:'var(--spark)', display:'flex', alignItems:'center', gap:3 }}><i className="ti ti-currency-pound" style={{ fontSize:10 }}/>£{Math.round(job.salary_min/1000)}–{Math.round(job.salary_max/1000)}k</div>}
                {job.work_style && <div style={{ background:'var(--gd)', border:'0.5px solid var(--gb)', borderRadius:99, padding:'4px 9px', fontSize:10, color:'var(--green)', display:'flex', alignItems:'center', gap:3 }}><i className="ti ti-home" style={{ fontSize:10 }}/>{job.work_style}</div>}
                {dist !== null && <div style={{ background:'var(--bg4)', border:'0.5px solid var(--border)', borderRadius:99, padding:'4px 9px', fontSize:10, color:'var(--t2)', display:'flex', alignItems:'center', gap:3 }}><i className="ti ti-map-pin" style={{ fontSize:10 }}/>{dist} miles from you</div>}
                {job.job_type && <div style={{ background:'var(--bg4)', border:'0.5px solid var(--border)', borderRadius:99, padding:'4px 9px', fontSize:10, color:'var(--t2)', display:'flex', alignItems:'center', gap:3 }}><i className="ti ti-clock" style={{ fontSize:10 }}/>{job.job_type}</div>}
              </div>
              <div style={{ background:'var(--sd)', border:'0.5px solid var(--sb)', borderRadius:10, padding:'10px 12px', display:'flex', alignItems:'center', gap:9, marginBottom:10 }}>
                <div style={{ fontSize:20, fontWeight:500, color:'var(--spark)' }}>{score}%</div>
                <div><div style={{ fontSize:11, color:'var(--spark)', fontWeight:500 }}>Great fit</div><div style={{ fontSize:10, color:'var(--t2)' }}>Matches your salary, location and seniority</div></div>
              </div>
              {job.description && (<><div className="sec-label">ABOUT THE ROLE</div><div style={{ fontSize:12, color:'var(--t2)', lineHeight:1.6, marginBottom:10 }}>{job.description}</div></>)}
              {job.skills_required && (<><div className="sec-label">SKILLS</div><div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:10 }}>{job.skills_required.split(',').map(s => <span key={s} style={{ background:'var(--bg3)', border:'0.5px solid var(--border)', borderRadius:7, padding:'4px 8px', fontSize:10, color:'var(--t2)' }}>{s.trim()}</span>)}</div></>)}
              {job.availability && (<><div className="sec-label">AVAILABILITY</div><div style={{ background:'var(--gd)', border:'0.5px solid var(--gb)', borderRadius:9, padding:'8px 11px', marginBottom:10, display:'flex', alignItems:'center', gap:7 }}><i className="ti ti-calendar-check" style={{ fontSize:13, color:'var(--green)', flexShrink:0 }}/><span style={{ fontSize:11, color:'var(--green)', fontWeight:500 }}>{job.availability}</span></div></>)}
              {job.perks && (<><div className="sec-label">PERKS</div><div style={{ display:'flex', flexDirection:'column', gap:4, marginBottom:14 }}>{job.perks.split('\n').filter(Boolean).map(p => <div key={p} style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'var(--t2)' }}><i className="ti ti-check" style={{ fontSize:12, color:'var(--green)' }}/>{p}</div>)}</div></>)}
            </div>
          </div>
        )}
      </div>

      {/* Action bar */}
      <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:16, padding:'12px 20px 14px', background:'var(--bg)', flexShrink:0 }}>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
          <button onClick={doUndo} style={{ width:44, height:44, borderRadius:'50%', border:'0.5px solid var(--border)', background:'var(--bg3)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <i className="ti ti-rotate-clockwise" style={{ fontSize:18, color:'var(--spark)' }}/>
          </button>
          <span style={{ fontSize:9, color:'var(--t3)' }}>Rewind</span>
        </div>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
          <button onClick={doPass} style={{ width:54, height:54, borderRadius:'50%', border:'1.5px solid var(--border2)', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <i className="ti ti-x" style={{ fontSize:22, color:'#666' }}/>
          </button>
          <span style={{ fontSize:9, color:'var(--t3)' }}>Pass</span>
        </div>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
          <button onClick={doApply} style={{ width:66, height:66, borderRadius:'50%', background:'var(--spark)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow:'0 0 0 4px var(--sd)' }}>
            <i className="ti ti-flame" style={{ fontSize:28, color:'#000' }}/>
          </button>
          <span style={{ fontSize:9, color:'var(--spark)', fontWeight:500 }}>Apply</span>
        </div>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
          <button onClick={doSave} style={{ width:44, height:44, borderRadius:'50%', border:'0.5px solid var(--border)', background:'var(--bg3)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <i className="ti ti-bookmark" style={{ fontSize:18, color:'var(--t2)' }}/>
          </button>
          <span style={{ fontSize:9, color:'var(--t3)' }}>Save</span>
        </div>
      </div>

      <CandNav unreadSparks={unread}/>
    </>
  )
}
