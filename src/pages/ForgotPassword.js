import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ForgotPassword() {
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleReset() {
    if (!email) return
    setLoading(true)
    await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/reset-password' })
    setLoading(false)
    setSent(true)
  }

  if (sent) return (
    <>
      <div className="status-bar"><span>9:41</span><div className="status-icons"><i className="ti ti-wifi"/><i className="ti ti-battery-2"/></div></div>
      <div className="confirm-screen">
        <div className="confirm-icon" style={{ width:64, height:64, background:'var(--green)' }}><i className="ti ti-mail-check" style={{ fontSize:28, color:'#fff' }}/></div>
        <div className="confirm-title">Check your email</div>
        <div className="confirm-sub">We've sent a password reset link to <strong style={{ color:'#fff' }}>{email}</strong></div>
        <button className="btn-primary" style={{ width:'100%' }} onClick={() => nav('/login')}><i className="ti ti-login"/> Back to sign in</button>
      </div>
    </>
  )

  return (
    <>
      <div className="status-bar"><span>9:41</span><div className="status-icons"><i className="ti ti-wifi"/><i className="ti ti-battery-2"/></div></div>
      <div className="ob-wrap">
        <button className="back-btn" onClick={() => nav('/login')}><i className="ti ti-arrow-left"/> Back</button>
        <div className="ob-h">Reset your password</div>
        <div className="ob-sub">Enter your email and we'll send you a reset link.</div>
        <div className="input-row"><i className="ti ti-mail"/><input type="email" placeholder="Your email address" value={email} onChange={e => setEmail(e.target.value)}/></div>
        <button className="btn-primary" onClick={handleReset} disabled={loading || !email}>
          {loading ? <i className="ti ti-loader spin"/> : <i className="ti ti-send"/>} Send reset link
        </button>
      </div>
    </>
  )
}
