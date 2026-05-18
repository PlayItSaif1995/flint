import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import CandNav from '../../components/CandNav'

export default function CandProfile() {
  const nav = useNavigate()
  const { profile } = useAuth()

  return (
    <>
      <div className="status-bar" style={{ background:'var(--bg2)' }}><span>9:41</span><div className="status-icons"><i className="ti ti-wifi"/><i className="ti ti-battery-2"/></div></div>
      <div className="page-header"><h1>My profile</h1><button onClick={() => nav('/settings')} style={{ background:'none', border:'none', cursor:'pointer' }}><i className="ti ti-settings" style={{ fontSize:18, color:'var(--t2)' }}/></button></div>
      <div className="scroll" style={{ background:'var(--bg)' }}>
        {/* Photo area */}
        <div style={{ width:'100%', height:160, background:'var(--bg3)', position:'relative', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5 }}>
            <i className="ti ti-camera" style={{ fontSize:24, color:'var(--t3)' }}/>
            <span style={{ fontSize:11, color:'var(--t3)' }}>Profile photo</span>
          </div>
          <button onClick={() => nav('/settings/edit-profile')} style={{ position:'absolute', bottom:9, right:9, background:'var(--spark)', border:'none', borderRadius:8, padding:'7px 12px', color:'#000', fontSize:11, fontWeight:500, fontFamily:'inherit', cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
            <i className="ti ti-edit"/>Edit photo
          </button>
        </div>

        <div style={{ padding:'12px 15px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:2 }}>
            <div style={{ fontSize:19, fontWeight:500, color:'#fff' }}>{profile?.full_name || 'Your name'}</div>
            <button onClick={() => nav('/settings/edit-profile')} style={{ background:'none', border:'none', cursor:'pointer' }}><i className="ti ti-pencil" style={{ fontSize:13, color:'var(--t3)' }}/></button>
          </div>
          <div style={{ fontSize:12, color:'var(--spark)', marginBottom:6, display:'flex', alignItems:'center', gap:4 }}>
            <i className="ti ti-briefcase" style={{ fontSize:12 }}/>{profile?.job_title || profile?.profession || 'Add your profession'}
          </div>
          <div style={{ fontSize:11, color:'var(--t2)', lineHeight:1.6, marginBottom:11 }}>
            📍 {profile?.location_name || 'Location not set'} · Open to roles within {profile?.search_radius?.split(' ')[1] || '25'} miles
          </div>

          {/* Stats */}
          <div style={{ display:'flex', gap:7, marginBottom:12 }}>
            {[['14','Profile views'],['91%','Avg fit'],['0','Applied'],['0','Sparks']].map(([n,l]) => (
              <div key={l} style={{ flex:1, background:'var(--bg3)', border:'0.5px solid var(--border)', borderRadius:9, padding:9, textAlign:'center' }}>
                <div style={{ fontSize:16, fontWeight:500, color: l==='Avg fit' ? 'var(--spark)' : '#fff' }}>{n}</div>
                <div style={{ fontSize:9, color:'var(--t3)' }}>{l}</div>
              </div>
            ))}
          </div>

          {/* Pro teaser */}
          <div onClick={() => nav('/premium')} style={{ background:'linear-gradient(135deg,#1a0a00,var(--bg2))', border:'0.5px solid var(--sb)', borderRadius:11, padding:11, marginBottom:11, display:'flex', gap:8, alignItems:'center', cursor:'pointer' }}>
            <div style={{ width:30, height:30, background:'var(--spark)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <i className="ti ti-eye" style={{ fontSize:14, color:'#000' }}/>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:12, fontWeight:500, color:'#fff' }}>14 employers viewed you</div>
              <div style={{ fontSize:10, color:'var(--spark)' }}>Upgrade to Pro to see who →</div>
            </div>
            <i className="ti ti-lock" style={{ fontSize:14, color:'var(--spark)' }}/>
          </div>

          {/* Skills */}
          {profile?.skills && (<>
            <div className="sec-label">SKILLS</div>
            <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:11 }}>
              {profile.skills.split(',').map(s => <span key={s} style={{ background:'var(--bg3)', border:'0.5px solid var(--border)', borderRadius:7, padding:'4px 8px', fontSize:10, color:'var(--t2)' }}>{s.trim()}</span>)}
            </div>
          </>)}

          {/* Bio */}
          {profile?.bio && (<>
            <div className="sec-label">ABOUT ME</div>
            <div style={{ fontSize:12, color:'var(--t2)', lineHeight:1.6, marginBottom:11 }}>{profile.bio}</div>
          </>)}

          <div style={{ height:12 }}/>
        </div>
      </div>
      <CandNav/>
    </>
  )
}
