import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function SignUp() {
  const nav = useNavigate()
  const { signUp } = useAuth()
  const [form, setForm] = useState({ name:'', email:'', phone:'', password:'' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [verifyScreen, setVerifyScreen] = useState(false)

  async function handleSubmit() {
    if (!form.name || form.name.trim().length < 2) { setError('Please enter your full name'); return }
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError('Enter a valid email address'); return }
    if (!form.password || form.password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (/^(.)\1+$/.test(form.password)) { setError('Please choose a stronger password'); return }
    setLoading(true); setError('')
    const { error: e } = await signUp(form.email, form.password, form.name, form.phone)
    setLoading(false)
    if (e) setError(e.message)
    else setVerifyScreen(true)
  }

  if (verifyScreen) return (
    <>
      <div className="status-bar"><span>9:41</span><div className="status-icons"><i className="ti ti-wifi"/><i className="ti ti-battery-2"/></div></div>
      <div className="confirm-screen">
        <div className="confirm-icon" style={{ width:72, height:72, background:'var(--spark)', marginBottom:18 }}>
          <i className="ti ti-mail" style={{ fontSize:32, color:'#000' }}/>
        </div>
        <div className="confirm-title">Check your email</div>
        <div className="confirm-sub">We sent a verification link to <strong style={{ color:'#fff' }}>{form.email}</strong>. Click it to activate your account then come back and sign in.</div>
        <div style={{ background:'var(--bg2)', border:'0.5px solid var(--border)', borderRadius:13, padding:13, width:'100%', marginBottom:14 }}>
          <div style={{ fontSize:11, color:'var(--t2)', lineHeight:1.7 }}>
            <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:5 }}><i className="ti ti-circle-check" style={{ color:'var(--green)', fontSize:14 }}/> Check your spam folder if you don't see it</div>
            <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:5 }}><i className="ti ti-circle-check" style={{ color:'var(--green)', fontSize:14 }}/> The link expires in 24 hours</div>
            <div style={{ display:'flex', alignItems:'center', gap:7 }}><i className="ti ti-circle-check" style={{ color:'var(--green)', fontSize:14 }}/> Once verified, sign in below</div>
          </div>
        </div>
        <button className="btn-primary" onClick={() => nav('/login')} style={{ width:'100%', marginBottom:8 }}>
          <i className="ti ti-login"/> Go to sign in
        </button>
        <button className="btn-secondary" onClick={() => setVerifyScreen(false)} style={{ width:'100%' }}>
          <i className="ti ti-arrow-left"/> Back
        </button>
      </div>
    </>
  )

  return (
    <>
      <div className="status-bar"><span>9:41</span><div className="status-icons"><i className="ti ti-wifi"/><i className="ti ti-battery-2"/></div></div>
      <div className="ob-wrap">
        <button className="back-btn" onClick={() => nav('/')}><i className="ti ti-arrow-left"/> Back</button>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:22 }}>
          <div className="logo-icon" style={{ width:30, height:30 }}>
            <svg viewBox="0 0 32 32" fill="none" width={18} height={18}><path d="M19 3L10 17H16L13 29L24 13H17.5L19 3Z" fill="white" opacity="0.95"/></svg>
          </div>
          <span className="logo-text">flint<span>.</span></span>
        </div>
        <div className="ob-h">Create your account</div>
        <div className="ob-sub">Free forever for candidates. Takes 2 minutes.</div>
        <div className="input-row"><i className="ti ti-user"/><input placeholder="Full name" value={form.name} onChange={e => setForm({...form, name:e.target.value})}/></div>
        <div className="input-row"><i className="ti ti-mail"/><input type="email" placeholder="Email address" value={form.email} onChange={e => setForm({...form, email:e.target.value})}/></div>
        <div className="input-row"><i className="ti ti-phone"/><input type="tel" placeholder="Phone number (optional)" value={form.phone} onChange={e => setForm({...form, phone:e.target.value})}/></div>
        <div className="input-row"><i className="ti ti-lock"/><input type="password" placeholder="Create a password" value={form.password} onChange={e => setForm({...form, password:e.target.value})}/></div>
        {error && <p style={{ fontSize:12, color:'var(--red)', marginBottom:10 }}>{error}</p>}
        <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? <i className="ti ti-loader spin"/> : <i className="ti ti-bolt"/>} {loading ? 'Creating account...' : 'Create account'}
        </button>
        <p style={{ fontSize:13, color:'var(--t2)', textAlign:'center', marginTop:16 }}>
          Already have an account? <button onClick={() => nav('/login')} style={{ background:'none', border:'none', color:'var(--spark)', fontSize:13, fontFamily:'inherit', cursor:'pointer', fontWeight:500 }}>Sign in</button>
        </p>
      </div>
    </>
  )
}
