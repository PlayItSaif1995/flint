import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

export default function EmpVerify() {
  const nav = useNavigate()
  const { user } = useAuth()
  const [form, setForm] = useState({ workEmail:'', phone:'', role:'' })
  const [loading, setLoading] = useState(false)

  async function complete() {
    setLoading(true)
    await supabase.from('profiles').upsert({ 
      id: user.id, 
      onboarded: true, 
      active_role: 'employer', 
      role: 'employer', 
      work_email: form.workEmail, 
      company_role: form.role,
      has_employer_profile: true
    })
    // Small delay to let auth context refresh, then force navigate
    setTimeout(() => {
      setLoading(false)
      window.location.href = '/employer'
    }, 500)
  }

  return (
    <>
      <div className="status-bar"><span>9:41</span><div className="status-icons"><i className="ti ti-wifi"/><i className="ti ti-battery-2"/></div></div>
      <div className="ob-wrap">
        <button className="back-btn" onClick={() => nav('/onboarding/company')}><i className="ti ti-arrow-left"/> Back</button>
        <div className="ob-progress"><div className="ob-step done"/><div className="ob-step done"/><div className="ob-step done"/></div>
        <div className="ob-h">Verify your company</div>
        <div className="ob-sub">Verified employers get 40% more candidate applications.</div>
        <div style={{ background:'var(--gd)', border:'0.5px solid var(--gb)', borderRadius:11, padding:12, marginBottom:14, display:'flex', gap:9, alignItems:'flex-start' }}>
          <i className="ti ti-shield-check" style={{ fontSize:14, color:'var(--green)', flexShrink:0, marginTop:1 }}/>
          <p style={{ fontSize:12, color:'#bbb', lineHeight:1.5 }}>We'll send a verification link to your work email to confirm you're an authorised representative.</p>
        </div>
        <div className="input-row"><i className="ti ti-mail"/><input type="email" placeholder="Work email *" value={form.workEmail} onChange={e => setForm({...form, workEmail:e.target.value})}/></div>
        <div className="input-row"><i className="ti ti-phone"/><input type="tel" placeholder="Company phone (optional)" value={form.phone} onChange={e => setForm({...form, phone:e.target.value})}/></div>
        <div className="input-row"><i className="ti ti-id-badge"/><input placeholder="Your role at the company" value={form.role} onChange={e => setForm({...form, role:e.target.value})}/></div>
        <div style={{ background:'var(--sd)', border:'0.5px solid var(--sb)', borderRadius:10, padding:'10px 12px', marginBottom:12, display:'flex', gap:7, alignItems:'flex-start' }}>
          <i className="ti ti-info-circle" style={{ fontSize:13, color:'var(--spark)', flexShrink:0, marginTop:1 }}/>
          <p style={{ fontSize:11, color:'#bbb', lineHeight:1.5 }}>Candidate contact details are <strong style={{ color:'var(--spark)' }}>hidden</strong> until a mutual spark.</p>
        </div>
        <div style={{ marginTop:'auto' }}>
          <button className="btn-primary" onClick={complete} disabled={loading || !form.workEmail}>
            {loading ? <i className="ti ti-loader spin"/> : null} Complete setup &amp; start hiring <i className="ti ti-rocket"/>
          </button>
        </div>
      </div>
    </>
  )
}
