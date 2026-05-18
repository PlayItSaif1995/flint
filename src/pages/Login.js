import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const nav = useNavigate()
  const { signIn } = useAuth()
  const [form, setForm] = useState({ email:'', password:'' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!form.email || !form.password) { setError('Please enter your email and password'); return }
    setLoading(true); setError('')
    const { error: e } = await signIn(form.email, form.password)
    setLoading(false)
    if (e) setError(e.message)
  }

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
        <div className="ob-h">Welcome back</div>
        <div className="ob-sub">Good to see you. Sign in to continue.</div>
        <div className="input-row"><i className="ti ti-mail"/><input type="email" placeholder="Email address" value={form.email} onChange={e => setForm({...form, email:e.target.value})}/></div>
        <div className="input-row"><i className="ti ti-lock"/><input type="password" placeholder="Password" value={form.password} onChange={e => setForm({...form, password:e.target.value})}/></div>
        <button onClick={() => nav('/forgot-password')} style={{ background:'none', border:'none', color:'var(--spark)', fontSize:12, fontFamily:'inherit', cursor:'pointer', textAlign:'right', display:'block', marginBottom:18, marginTop:-4, width:'100%' }}>Forgot password?</button>
        {error && <p style={{ fontSize:12, color:'var(--red)', marginBottom:10 }}>{error}</p>}
        <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? <i className="ti ti-loader spin"/> : <i className="ti ti-login"/>} {loading ? 'Signing in...' : 'Sign in'}
        </button>
        <p style={{ fontSize:13, color:'var(--t2)', textAlign:'center', marginTop:16 }}>
          No account? <button onClick={() => nav('/signup')} style={{ background:'none', border:'none', color:'var(--spark)', fontSize:13, fontFamily:'inherit', cursor:'pointer', fontWeight:500 }}>Sign up free</button>
        </p>
      </div>
    </>
  )
}
