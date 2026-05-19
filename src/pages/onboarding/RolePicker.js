import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function RolePicker() {
  const nav = useNavigate()
  const { profile } = useAuth()
  const [role, setRole] = useState('candidate')

  function goBack() {
    if (profile?.onboarded) {
      // Already onboarded — go back to wherever they came from
      if (profile.active_role === 'employer') nav('/employer/settings')
      else nav('/settings')
    } else {
      nav('/')
    }
  }

  function continueOn() {
    if (role === 'employer') nav('/onboarding/company')
    else nav('/onboarding/profession')
  }

  return (
    <>
      <div className="status-bar"><span>9:41</span><div className="status-icons"><i className="ti ti-wifi"/><i className="ti ti-battery-2"/></div></div>
      <div className="ob-wrap">
        <button className="back-btn" onClick={goBack}><i className="ti ti-arrow-left"/> Back</button>
        <div className="ob-progress"><div className="ob-step done"/><div className="ob-step"/><div className="ob-step"/><div className="ob-step"/></div>
        <div className="ob-h">How are you using Flint?</div>
        <div className="ob-sub">We'll tailor your experience. You can always add the other profile later.</div>

        <div onClick={() => setRole('candidate')} style={{ display:'flex', alignItems:'center', gap:13, background: role==='candidate' ? 'var(--sd)' : 'var(--bg3)', border: `0.5px solid ${role==='candidate' ? 'var(--spark)' : 'var(--border)'}`, borderRadius:'var(--radius)', padding:15, cursor:'pointer', marginBottom:10, transition:'all .15s' }}>
          <div style={{ width:42, height:42, borderRadius:11, background:'var(--sd)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <i className="ti ti-user" style={{ fontSize:20, color:'var(--spark)' }}/>
          </div>
          <div><div style={{ fontSize:14, fontWeight:500, color:'#fff', marginBottom:2 }}>I'm looking for work</div><div style={{ fontSize:11, color:'var(--t2)' }}>Browse roles, swipe right, get sparked</div></div>
        </div>

        <div onClick={() => setRole('employer')} style={{ display:'flex', alignItems:'center', gap:13, background: role==='employer' ? 'var(--gd)' : 'var(--bg3)', border: `0.5px solid ${role==='employer' ? 'var(--green)' : 'var(--border)'}`, borderRadius:'var(--radius)', padding:15, cursor:'pointer', transition:'all .15s' }}>
          <div style={{ width:42, height:42, borderRadius:11, background:'var(--gd)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <i className="ti ti-building" style={{ fontSize:20, color:'var(--green)' }}/>
          </div>
          <div><div style={{ fontSize:14, fontWeight:500, color:'#fff', marginBottom:2 }}>I'm hiring</div><div style={{ fontSize:11, color:'var(--t2)' }}>Post roles, headhunt talent, spark candidates</div></div>
        </div>

        <div style={{ marginTop:'auto' }}>
          <button className="btn-primary" onClick={continueOn}>Continue <i className="ti ti-arrow-right"/></button>
        </div>
      </div>
    </>
  )
}
