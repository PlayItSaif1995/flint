import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'

export default function CandSettings() {
  const nav = useNavigate()
  const { profile, signOut, user } = useAuth()
  const [showLogout, setShowLogout] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const hasEmpProfile = profile?.has_employer_profile

  async function handleLogout() { await signOut(); nav('/') }

  async function handleDelete() {
    setDeleting(true)
    try {
      await supabase.functions.invoke('delete-user', { body: { user_id: user.id } })
    } catch (e) {
      console.error('Delete error:', e)
    }
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <>
      <div className="status-bar" style={{ background:'var(--bg2)' }}><span>9:41</span><div className="status-icons"><i className="ti ti-wifi"/><i className="ti ti-battery-2"/></div></div>
      <div className="page-header"><h1>Settings</h1><button onClick={() => nav('/profile')} style={{ background:'none', border:'none', cursor:'pointer' }}><i className="ti ti-x" style={{ fontSize:18, color:'var(--t2)' }}/></button></div>

      <div className="scroll" style={{ background:'var(--bg)' }}>
        {/* Profile hero */}
        <div style={{ padding:16, display:'flex', flexDirection:'column', alignItems:'center', gap:5, borderBottom:'0.5px solid var(--border)', background:'var(--bg2)' }}>
          <div onClick={() => nav('/settings/edit-profile')} style={{ width:68, height:68, borderRadius:'50%', background:'var(--spark)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:21, fontWeight:500, color:'#000', position:'relative', cursor:'pointer' }}>
            {(profile?.full_name || 'U').substring(0,2).toUpperCase()}
            <div style={{ position:'absolute', bottom:0, right:0, width:20, height:20, background:'var(--bg2)', border:'0.5px solid var(--border2)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <i className="ti ti-camera" style={{ fontSize:9, color:'var(--t2)' }}/>
            </div>
          </div>
          <div style={{ fontSize:15, fontWeight:500, color:'#fff' }}>{profile?.full_name || 'Your name'}</div>
          <div style={{ fontSize:10, color:'var(--spark)', background:'var(--sd)', border:'0.5px solid var(--sb)', borderRadius:99, padding:'2px 8px' }}>{profile?.job_title || profile?.profession || 'Add profession'}</div>
        </div>

        {/* Premium banner */}
        <div className="prem-banner" onClick={() => nav('/premium')}>
          <div className="prem-ic"><i className="ti ti-crown"/></div>
          <div className="prem-text"><div className="prem-title">Flint Pro</div><div className="prem-sub">See who viewed you, priority placement + more</div></div>
          <button className="prem-cta" onClick={e => { e.stopPropagation(); nav('/premium') }}>Upgrade</button>
        </div>

        {/* Dual profile switcher */}
        <div className="mode-switcher">
          <div className="mode-switcher-title">MY PROFILES</div>
          <div className="mode-options">
            <div className="mode-opt active">
              <div className="mode-opt-ic"><i className="ti ti-user"/></div>
              <div><div className="mode-opt-label">Candidate</div><div className="mode-opt-sub">Active now</div></div>
              <div className="active-dot"/>
            </div>
            {hasEmpProfile && (
              <div className="mode-opt emp" onClick={() => nav('/employer')}>
                <div className="mode-opt-ic"><i className="ti ti-building"/></div>
                <div><div className="mode-opt-label">Employer</div><div className="mode-opt-sub">Switch view</div></div>
              </div>
            )}
          </div>
          {!hasEmpProfile && (
            <div className="add-profile-btn" onClick={() => nav('/onboarding/company')}>
              <i className="ti ti-plus"/>
              <div><div className="add-profile-btn-title">Add employer profile</div><div className="add-profile-btn-sub">Recruit for your company while job hunting</div></div>
            </div>
          )}
        </div>

        {/* Account */}
        <div style={{ padding:'3px 0' }}>
          <div style={{ fontSize:10, color:'var(--t3)', letterSpacing:'.5px', padding:'8px 15px 3px' }}>ACCOUNT</div>
          <div className="s-row" onClick={() => nav('/settings/edit-profile')}><div className="s-icon sp"><i className="ti ti-user"/></div><div className="s-label">Edit profile</div><i className="ti ti-chevron-right" style={{ fontSize:13, color:'var(--t3)' }}/></div>
          <div className="s-row" onClick={() => nav('/settings/edit-profile')}><div className="s-icon"><i className="ti ti-briefcase"/></div><div className="s-label">Profession & experience</div><span className="s-value">{profile?.profession}</span><i className="ti ti-chevron-right" style={{ fontSize:13, color:'var(--t3)' }}/></div>
          <div className="s-row"><div className="s-icon"><i className="ti ti-file-cv"/></div><div className="s-label">Update CV</div><span className="s-value">{profile?.cv_path ? 'Uploaded' : 'Not uploaded'}</span><i className="ti ti-chevron-right" style={{ fontSize:13, color:'var(--t3)' }}/></div>
          <div className="s-row"><div className="s-icon"><i className="ti ti-mail"/></div><div className="s-label">Email address</div><span className="s-value" style={{ maxWidth:120, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{profile?.email}</span><i className="ti ti-chevron-right" style={{ fontSize:13, color:'var(--t3)' }}/></div>
          <div className="s-row"><div className="s-icon"><i className="ti ti-lock"/></div><div className="s-label">Change password</div><i className="ti ti-chevron-right" style={{ fontSize:13, color:'var(--t3)' }}/></div>
        </div>

        {/* Job prefs */}
        <div style={{ padding:'3px 0' }}>
          <div style={{ fontSize:10, color:'var(--t3)', letterSpacing:'.5px', padding:'8px 15px 3px' }}>JOB PREFERENCES</div>
          <div className="s-row" onClick={() => nav('/settings/edit-profile')}><div className="s-icon"><i className="ti ti-map-pin"/></div><div className="s-label">Location & radius</div><span className="s-value">{profile?.search_radius?.split(' ')[1] || '25'}mi from me</span><i className="ti ti-chevron-right" style={{ fontSize:13, color:'var(--t3)' }}/></div>
          <div className="s-row" onClick={() => nav('/settings/edit-profile')}><div className="s-icon"><i className="ti ti-currency-pound"/></div><div className="s-label">Minimum salary</div><span className="s-value">{profile?.min_salary || '£50k+'}</span><i className="ti ti-chevron-right" style={{ fontSize:13, color:'var(--t3)' }}/></div>
          <div className="s-row" onClick={() => nav('/settings/edit-profile')}><div className="s-icon"><i className="ti ti-home"/></div><div className="s-label">Work style</div><span className="s-value">{profile?.work_style || 'Any'}</span><i className="ti ti-chevron-right" style={{ fontSize:13, color:'var(--t3)' }}/></div>
          <div className="s-row"><div className="s-icon"><i className="ti ti-eye"/></div><div className="s-label">Open to opportunities</div><button className="toggle on" onClick={e => e.currentTarget.classList.toggle('on')}/></div>
        </div>

        {/* Notifications */}
        <div style={{ padding:'3px 0' }}>
          <div style={{ fontSize:10, color:'var(--t3)', letterSpacing:'.5px', padding:'8px 15px 3px' }}>NOTIFICATIONS</div>
          <div className="s-row"><div className="s-icon"><i className="ti ti-flame"/></div><div className="s-label">New sparks</div><button className="toggle on" onClick={e => e.currentTarget.classList.toggle('on')}/></div>
          <div className="s-row"><div className="s-icon"><i className="ti ti-file-text"/></div><div className="s-label">Application updates</div><button className="toggle on" onClick={e => e.currentTarget.classList.toggle('on')}/></div>
          <div className="s-row"><div className="s-icon"><i className="ti ti-message-circle"/></div><div className="s-label">New messages</div><button className="toggle on" onClick={e => e.currentTarget.classList.toggle('on')}/></div>
        </div>

        {/* Support */}
        <div style={{ padding:'3px 0' }}>
          <div style={{ fontSize:10, color:'var(--t3)', letterSpacing:'.5px', padding:'8px 15px 3px' }}>SUPPORT</div>
          <div className="s-row"><div className="s-icon"><i className="ti ti-help-circle"/></div><div className="s-label">Help & FAQ</div><i className="ti ti-chevron-right" style={{ fontSize:13, color:'var(--t3)' }}/></div>
          <div className="s-row"><div className="s-icon"><i className="ti ti-shield"/></div><div className="s-label">Privacy settings</div><i className="ti ti-chevron-right" style={{ fontSize:13, color:'var(--t3)' }}/></div>
        </div>

        {/* Danger zone */}
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

      {/* Logout modal */}
      {showLogout && (
        <div className="modal-overlay" onClick={() => setShowLogout(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Log out?</div>
            <div className="modal-sub">You'll need to sign in again to access your profile and applications.</div>
            <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
              <button className="btn-primary" style={{ background:'var(--red)', color:'#fff', marginBottom:0 }} onClick={handleLogout}><i className="ti ti-logout"/> Yes, log out</button>
              <button className="btn-secondary" onClick={() => setShowLogout(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete modal */}
      {showDelete && (
        <div className="modal-overlay" onClick={() => setShowDelete(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Delete your account?</div>
            <div className="modal-sub">This permanently deletes all your data — CV, applications, sparks and messages. You can sign up again with the same email after a few minutes.</div>
            <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
              <button className="btn-primary" style={{ background:'var(--red)', color:'#fff', marginBottom:0 }} onClick={handleDelete} disabled={deleting}>
                {deleting ? <i className="ti ti-loader spin"/> : <i className="ti ti-trash"/>} {deleting ? 'Deleting...' : 'Yes, delete my account'}
              </button>
              <button className="btn-secondary" onClick={() => setShowDelete(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
