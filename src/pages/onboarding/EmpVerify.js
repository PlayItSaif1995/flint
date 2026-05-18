import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

export default function EmpVerify() {
  const { user } = useAuth()
  const [form, setForm] = useState({ workEmail:'', phone:'', role:'' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [done, setDone] = useState(false)

  function validate() {
    const e = {}
    if (!form.workEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.workEmail)) e.workEmail = 'Enter a valid work email address'
    if (form.workEmail && /gmail|yahoo|hotmail|outlook|icloud/.test(form.workEmail.toLowerCase())) e.workEmail = 'Please use a work email, not a personal one'
    if (form.phone && !/^[\d\s\+\-\(\)]{7,15}$/.test(form.phone.trim())) e.phone = 'Enter a valid phone number'
    if (!form.role || form.role.trim().length < 2) e.role = 'Enter your role at the company'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function complete() {
    if (!validate()) return
    setLoading(true)

    // Try update first, then insert if no row exists
    const updates = {
      id: user.id,
      onboarded: true,
      active_role: 'employer',
      role: 'employer',
      work_email: form.workEmail,
      company_role: form.role,
      has_employer_profile: true,
      full_name: user.user_metadata?.full_name || '',
      email: user.email,
    }

    const { error } = await supabase.from('profiles').upsert(updates, { onConflict: 'id' })

    if (error) {
      console.error('Profile save error:', error)
      setErrors({ workEmail: 'Something went wrong. Please try again.' })
      setLoading(false)
      return
    }

    setDone(true)
    // Force full page reload so auth context re-reads the updated profile
    setTimeout(() => { window.location.replace('/employer') }, 800)
  }

  if (done) return (
    <div className="app-shell" style={{ alignItems:'center', justifyContent:'center', gap:14 }}>
      <i className="ti ti-rocket" style={{ fontSize:36, color:'var(--spark)' }}/>
      <div style={{ fontSize:18, fontWeight:500, color:'#fff' }}>All set!</div>
      <div style={{ fontSize:13, color:'var(--t2)' }}>Taking you to your dashboard...</div>
    </div>
  )

  return (
    <>
      <div className="status-bar"><span>9:41</span><div className="status-icons"><i className="ti ti-wifi"/><i className="ti ti-battery-2"/></div></div>
      <div className="ob-wrap">
        <div className="ob-progress"><div className="ob-step done"/><div className="ob-step done"/><div className="ob-step done"/></div>
        <div className="ob-h">Verify your company</div>
        <div className="ob-sub">Verified employers get 40% more candidate applications.</div>
        <div style={{ background:'var(--gd)', border:'0.5px solid var(--gb)', borderRadius:11, padding:12, marginBottom:14, display:'flex', gap:9, alignItems:'flex-start' }}>
          <i className="ti ti-shield-check" style={{ fontSize:14, color:'var(--green)', flexShrink:0, marginTop:1 }}/>
          <p style={{ fontSize:12, color:'#bbb', lineHeight:1.5 }}>We'll send a verification link to your work email to confirm you're an authorised representative.</p>
        </div>
        <div className="input-row" style={{ borderColor: errors.workEmail ? 'var(--red)' : '' }}>
          <i className="ti ti-mail"/>
          <input type="email" placeholder="Work email * (e.g. saif@acme.co.uk)" value={form.workEmail} onChange={e => setForm({...form, workEmail:e.target.value})}/>
        </div>
        {errors.workEmail && <p style={{ fontSize:11, color:'var(--red)', marginTop:-6, marginBottom:8 }}>{errors.workEmail}</p>}
        <div className="input-row">
          <i className="ti ti-phone"/>
          <input type="tel" placeholder="Company phone (optional, e.g. +44 20 7946 0958)" value={form.phone} onChange={e => setForm({...form, phone:e.target.value})}/>
        </div>
        {errors.phone && <p style={{ fontSize:11, color:'var(--red)', marginTop:-6, marginBottom:8 }}>{errors.phone}</p>}
        <div className="input-row" style={{ borderColor: errors.role ? 'var(--red)' : '' }}>
          <i className="ti ti-id-badge"/>
          <input placeholder="Your role at the company * (e.g. HR Manager)" value={form.role} onChange={e => setForm({...form, role:e.target.value})}/>
        </div>
        {errors.role && <p style={{ fontSize:11, color:'var(--red)', marginTop:-6, marginBottom:8 }}>{errors.role}</p>}
        <div style={{ background:'var(--sd)', border:'0.5px solid var(--sb)', borderRadius:10, padding:'10px 12px', marginBottom:12, display:'flex', gap:7, alignItems:'flex-start' }}>
          <i className="ti ti-info-circle" style={{ fontSize:13, color:'var(--spark)', flexShrink:0, marginTop:1 }}/>
          <p style={{ fontSize:11, color:'#bbb', lineHeight:1.5 }}>Candidate contact details are <strong style={{ color:'var(--spark)' }}>hidden</strong> until a mutual spark.</p>
        </div>
        <div style={{ marginTop:'auto' }}>
          <button className="btn-primary" onClick={complete} disabled={loading}>
            {loading ? <i className="ti ti-loader spin"/> : <i className="ti ti-rocket"/>} {loading ? 'Setting up your account...' : 'Complete setup & start hiring'}
          </button>
        </div>
      </div>
    </>
  )
}
