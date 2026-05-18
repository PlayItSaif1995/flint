import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import EmpNav from '../../components/EmpNav'

export default function EmpSettings() {
  const nav = useNavigate()
  const { profile, signOut, user } = useAuth()
  const [showLogout, setShowLogout] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const hasCandProfile = profile?.has_candidate_profile

  async function handleLogout() { await signOut(); nav('/') }

  async function handleDelete() {
    setDeleting(true)
    await supabase.from('applications').delete().eq('candidate_id', user.id)
    await supabase.from('matches').delete().or(`candidate_id.eq.${user.id},employer_id.eq.${user.id}`)
    await supabase.from('jobs').delete().eq('company_id', profile?.company_id)
    await supabase.from('companies').delete().eq('owner_id', user.id)
    await supabase.from('profiles').delete().eq('id', user.id)
    await supabase.auth.signOut()
    nav('/')
  }

  return (
    <>
      <div className="status-bar" style={{ background:'var(--bg2)' }}><span>9:41</span><div className="status-icons"><i className="ti ti-wifi"/><i className="ti ti-battery-2"/></div></div>
      <div className="page-header"><h1>Company settings</h1><button onClick={() => nav('/employer')} style={{ background:'none', border:'none', cursor:'pointer' }}><i className="ti ti-x" style={{ fontSize:18, color:'var(--t2)' }}/></button></div>
      <div className="scroll" style={{ background:'var(--bg)' }}>

        {/* Hero */}
        <div style={{ padding:16, display:'flex', flexDirection:'column', alignItems:'center', gap:5, borderBottom:'0.5px solid var(--border)', background:'var(--bg2)' }}>
          <div style={{ width:68, height:68, borderRadius:14, background:'#4F46E5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:21, fontWeight:500, color:'#fff' }}>
            {(profile?.full_name || 'CO').substring(0,2).toUpperCase()}
          </div>
          <div style={{ fontSize:15, fontWeight:500, color:'#fff' }}>{profile?.full_name || 'Your name'}</div>
          <div style={{ fontSize:10, color:'var(--green)', background:'var(--gd)', border:'0.5px solid var(--gb)', borderRadius:99, padding:'2px 8px' }}>Employer</div>
        </div>

        {/* Teams banner */}
        <div className="prem-banner" style={{ borderColor:'var(--gb)', background:'linear-gradient(135deg,var(--gd),#141414)' }} onClick={() => nav('/employer/premium')}>
          <div className="prem-ic" style={{ background:'var(--green)' }}><i className="ti ti-crown" style={{ color:'#fff' }}/></div>
          <div className="prem-text"><div className="prem-title">Flint for Teams</div><div className="prem-sub">Unlimited roles, headhunting, team access</div></div>
          <button className="prem-cta" style={{ background:'var(--green)' }}>Upgrade</button>
        </div>

        {/* Dual profile switcher */}
        <div className="mode-switcher">
          <div className="mode-switcher-title">MY PROFILES</div>
          <div className="mode-options">
            {hasCandProfile && (
              <div className="mode-opt" onClick={() => { supabase.from('profiles').update({ active_role:'candidate' }).eq('id', user.id).then(() => window.location.href = '/discover') }}>
                <div className="mode-opt-ic"><i className="ti ti-user"/></div>
                <div><div className="mode-opt-label">Candidate</div><div className="mode-opt-sub">Switch view</div></div>
              </div>
            )}
            <div className="mode-opt emp active">
              <div className="mode-opt-ic"><i className="ti ti-building"/></div>
              <div><div className="mode-opt-label">Employer</div><div className="mode-opt-sub">Active now</div></div>
              <div className="active-dot"/>
            </div>
          </div>
          {!hasCandProfile && (
            <div className="add-profile-btn" onClick={() => nav('/onboarding/profession')}>
              <i className="ti ti-plus"/>
              <div><div className="add-profile-btn-title">Add candidate profile</div><div className="add-profile-btn-sub">Look for work while running your company</div></div>
            </div>
          )}
        </div>

        {/* Company */}
        <div style={{ padding:'3px 0' }}>
          <div style={{ fontSize:10, color:'var(--t3)', letterSpacing:'.5px', padding:'8px 15px 3px' }}>COMPANY</div>
          <div className="s-row"><div className="s-icon gr"><i className="ti ti-building"/></div><div className="s-label">Edit company profile</div><i className="ti ti-chevron-right" style={{ fontSize:13, color:'var(--t3)' }}/></div>
          <div className="s-row"><div className="s-icon"><i className="ti ti-mail"/></div><div className="s-label">Email address</div><span className="s-value" style={{ maxWidth:130, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{profile?.email || user?.email}</span><i className="ti ti-chevron-right" style={{ fontSize:13, color:'var(--t3)' }}/></div>
          <div className="s-row"><div className="s-icon"><i className="ti ti-lock"/></div><div className="s-label">Change password</div><i className="ti ti-chevron-right" style={{ fontSize:13, color:'var(--t3)' }}/></div>
        </div>

        {/* Billing */}
        <div style={{ padding:'3px 0' }}>
          <div style={{ fontSize:10, color:'var(--t3)', letterSpacing:'.5px', padding:'8px 15px 3px' }}>BILLING</div>
          <div className="s-row" onClick={() => nav('/employer/premium')}><div className="s-icon gr"><i className="ti ti-receipt"/></div><div className="s-label">Current plan</div><span className="s-value" style={{ color:'var(--green)' }}>Free trial</span><i className="ti ti-chevron-right" style={{ fontSize:13, color:'var(--t3)' }}/></div>
          <div className="s-row" onClick={() => nav('/employer/premium')}><div className="s-icon"><i className="ti ti-credit-card"/></div><div className="s-label">Payment method</div><span className="s-value">Add card</span><i className="ti ti-chevron-right" style={{ fontSize:13, color:'var(--t3)' }}/></div>
        </div>

        {/* Notifications */}
        <div style={{ padding:'3px 0' }}>
          <div style={{ fontSize:10, color:'var(--t3)', letterSpacing:'.5px', padding:'8px 15px 3px' }}>NOTIFICATIONS</div>
          <div className="s-row"><div className="s-icon"><i className="ti ti-users"/></div><div className="s-label">New applicants</div><button className="toggle on" onClick={e => e.currentTarget.classList.toggle('on')}/></div>
          <div className="s-row"><div className="s-icon"><i className="ti ti-flame"/></div><div className="s-label">New sparks</div><button className="toggle on" onClick={e => e.currentTarget.classList.toggle('on')}/></div>
          <div className="s-row"><div className="s-icon"><i className="ti ti-message-circle"/></div><div className="s-label">New messages</div><button className="toggle on" onClick={e => e.currentTarget.classList.toggle('on')}/></div>
        </div>

        {/* Support */}
        <div style={{ padding:'3px 0' }}>
          <div style={{ fontSize:10, color:'var(--t3)', letterSpacing:'.5px', padding:'8px 15px 3px' }}>SUPPORT</div>
          <div className="s-row" onClick={() => window.open('mailto:support@flint.app')}><div className="s-icon"><i className="ti ti-help-circle"/></div><div className="s-label">Help & FAQ</div><i className="ti ti-chevron-right" style={{ fontSize:13, color:'var(--t3)' }}/></div>
          <div className="s-row" onClick={() => window.open('https://flint.app/terms', '_blank')}><div className="s-icon"><i className="ti ti-file-text"/></div><div className="s-label">Terms of Service</div><i className="ti ti-chevron-right" style={{ fontSize:13, color:'var(--t3)' }}/></div>
          <div className="s-row" onClick={() => window.open('https://flint.app/privacy', '_blank')}><div className="s-icon"><i className="ti ti-shield"/></div><div className="s-label">Privacy Policy</div><i className="ti ti-chevron-right" style={{ fontSize:13, color:'var(--t3)' }}/></div>
        </div>

        {/* Danger */}
        <div style={{ margin:'10px 14px', background:'var(--rd)', border:'0.5px solid var(--rb)', borderRadius:12, overflow:'hidden' }}>
          <div onClick={() => setShowLogout(true)} style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 14px', cursor:'pointer', borderBottom:'0.5px solid var(--rb)' }}>
            <i className="ti ti-logout" style={{ fontSize:16, color:'var(--red)', flexShrink:0 }}/>
            <div><div style={{ fontSize:13, color:'var(--red)', fontWeight:500 }}>Log out</div><div style={{ fontSize:10, color:'#e5484d99' }}>Sign out of your account</div></div>
          </div>
          <div onClick={() => setShowDelete(true)} style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 14px', cursor:'pointer' }}>
            <i className="ti ti-trash" style={{ fontSize:16, color:'var(--red)', flexShrink:0 }}/>
            <div><div style={{ fontSize:13, color:'var(--red)', fontWeight:500 }}>Delete account</div><div style={{ fontSize:10, color:'#e5484d99' }}>Permanently delete all your data</div></div>
          </div>
        </div>
        <div style={{ height:20 }}/>
      </div>

      {showLogout && (
        <div className="modal-overlay" onClick={() => setShowLogout(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Log out?</div>
            <div className="modal-sub">You'll need to sign in again to access your dashboard.</div>
            <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
              <button className="btn-primary" style={{ background:'var(--red)', color:'#fff', marginBottom:0 }} onClick={handleLogout}><i className="ti ti-logout"/> Yes, log out</button>
              <button className="btn-secondary" onClick={() => setShowLogout(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showDelete && (
        <div className="modal-overlay" onClick={() => setShowDelete(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Delete your account?</div>
            <div className="modal-sub">This permanently deletes your company, all posted roles, matches and messages. This cannot be undone.</div>
            <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
              <button className="btn-primary" style={{ background:'var(--red)', color:'#fff', marginBottom:0 }} onClick={handleDelete} disabled={deleting}>
                {deleting ? <i className="ti ti-loader spin"/> : <i className="ti ti-trash"/>} {deleting ? 'Deleting...' : 'Yes, delete everything'}
              </button>
              <button className="btn-secondary" onClick={() => setShowDelete(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      <EmpNav/>
    </>
  )
}
