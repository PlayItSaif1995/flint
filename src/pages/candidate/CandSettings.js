import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'

export default function CandSettings() {
  const nav = useNavigate()
  const { profile, signOut, user, refreshProfile } = useAuth()
  const [showLogout, setShowLogout] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [sheet, setSheet] = useState(null) // { field, label, type, options, value }
  const [sheetValue, setSheetValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [notifs, setNotifs] = useState({ new_sparks:true, app_updates:true, new_messages:true, open_to_work:true })
  const hasEmpProfile = profile?.has_employer_profile

  useEffect(() => {
    if (profile?.notification_prefs) {
      try { setNotifs({ ...notifs, ...JSON.parse(profile.notification_prefs) }) } catch {}
    }
  }, [profile])

  function openSheet(field, label, type, options = null) {
    const current = profile?.[field] || ''
    setSheet({ field, label, type, options })
    setSheetValue(current)
  }

  async function saveSheet() {
    setSaving(true)
    await supabase.from('profiles').update({ [sheet.field]: sheetValue }).eq('id', user.id)
    await refreshProfile()
    setSaving(false)
    setSheet(null)
  }

  async function handleLogout() { await signOut(); nav('/') }

  async function handleDelete() {
    setDeleting(true)
    try { await supabase.functions.invoke('delete-user', { body: { user_id: user.id } }) } catch {}
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  async function toggleNotif(key) {
    const updated = { ...notifs, [key]: !notifs[key] }
    setNotifs(updated)
    await supabase.from('profiles').update({ notification_prefs: JSON.stringify(updated) }).eq('id', user.id)
  }

  function Toggle({ k }) {
    return <button className={`toggle ${notifs[k] ? 'on' : ''}`} onClick={() => toggleNotif(k)}/>
  }

  return (
    <>
      <div className="status-bar" style={{ background:'var(--bg2)' }}><span>9:41</span><div className="status-icons"><i className="ti ti-wifi"/><i className="ti ti-battery-2"/></div></div>
      <div className="page-header">
        <button onClick={() => nav('/profile')} style={{ background:'none', border:'none', cursor:'pointer' }}>
          <i className="ti ti-arrow-left" style={{ fontSize:18, color:'var(--t2)' }}/>
        </button>
        <h1>Settings</h1>
      </div>

      <div className="scroll" style={{ background:'var(--bg)' }}>
        {/* Hero */}
        <div style={{ padding:16, display:'flex', flexDirection:'column', alignItems:'center', gap:5, borderBottom:'0.5px solid var(--border)', background:'var(--bg2)' }}>
          <div onClick={() => nav('/settings/edit-profile', { state:{ from:'settings' } })} style={{ width:68, height:68, borderRadius:'50%', background:'var(--spark)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:21, fontWeight:500, color:'#000', cursor:'pointer', position:'relative' }}>
            {(profile?.full_name || 'U').split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}
            <div style={{ position:'absolute', bottom:0, right:0, width:22, height:22, background:'var(--bg2)', border:'0.5px solid var(--border)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <i className="ti ti-camera" style={{ fontSize:10, color:'var(--t2)' }}/>
            </div>
          </div>
          <div style={{ fontSize:15, fontWeight:500, color:'#fff' }}>{profile?.full_name || 'Your name'}</div>
          <div style={{ fontSize:10, color:'var(--spark)', background:'var(--sd)', border:'0.5px solid var(--sb)', borderRadius:99, padding:'2px 8px' }}>
            {profile?.job_title || profile?.profession || 'Add profession'}
          </div>
        </div>

        {/* Premium */}
        <div className="prem-banner" onClick={() => nav('/premium')}>
          <div className="prem-ic"><i className="ti ti-crown"/></div>
          <div className="prem-text"><div className="prem-title">Flint Pro</div><div className="prem-sub">See who viewed you, priority placement + more</div></div>
          <button className="prem-cta">Upgrade</button>
        </div>

        {/* Dual profile */}
        <div className="mode-switcher">
          <div className="mode-switcher-title">MY PROFILES</div>
          <div className="mode-options">
            <div className="mode-opt active">
              <div className="mode-opt-ic"><i className="ti ti-user"/></div>
              <div><div className="mode-opt-label">Candidate</div><div className="mode-opt-sub">Active now</div></div>
              <div className="active-dot"/>
            </div>
            {hasEmpProfile && (
              <div className="mode-opt emp" onClick={async () => {
                await supabase.from('profiles').update({ active_role:'employer' }).eq('id', user.id)
                window.location.href = '/employer'
              }}>
                <div className="mode-opt-ic"><i className="ti ti-building"/></div>
                <div><div className="mode-opt-label">Employer</div><div className="mode-opt-sub">Switch view</div></div>
              </div>
            )}
          </div>
          {!hasEmpProfile && (
            <div className="add-profile-btn" onClick={() => nav('/onboarding/company')}>
              <i className="ti ti-plus"/>
              <div><div className="add-profile-btn-title">Add employer profile</div><div className="add-profile-btn-sub">Recruit while job hunting</div></div>
            </div>
          )}
        </div>

        {/* Account */}
        <div style={{ padding:'3px 0' }}>
          <div style={{ fontSize:10, color:'var(--t3)', letterSpacing:'.5px', padding:'8px 15px 3px' }}>ACCOUNT</div>
          <div className="s-row" onClick={() => nav('/settings/edit-profile', { state:{ from:'settings' } })}>
            <div className="s-icon sp"><i className="ti ti-user"/></div><div className="s-label">Edit full profile</div><i className="ti ti-chevron-right" style={{ fontSize:13, color:'var(--t3)' }}/>
          </div>
          <div className="s-row" onClick={() => nav('/settings/edit-profile', { state:{ from:'settings' } })}>
            <div className="s-icon"><i className="ti ti-file-cv"/></div><div className="s-label">Update CV</div>
            <span className="s-value">{profile?.cv_path ? 'Uploaded ✓' : 'Not uploaded'}</span>
            <i className="ti ti-chevron-right" style={{ fontSize:13, color:'var(--t3)' }}/>
          </div>
          <div className="s-row" onClick={() => openSheet('email', 'Email address', 'text')}>
            <div className="s-icon"><i className="ti ti-mail"/></div><div className="s-label">Email address</div>
            <span className="s-value" style={{ maxWidth:120, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{profile?.email || user?.email}</span>
            <i className="ti ti-chevron-right" style={{ fontSize:13, color:'var(--t3)' }}/>
          </div>
          <div className="s-row" onClick={() => openSheet('password', 'New password', 'password')}>
            <div className="s-icon"><i className="ti ti-lock"/></div><div className="s-label">Change password</div><i className="ti ti-chevron-right" style={{ fontSize:13, color:'var(--t3)' }}/>
          </div>
        </div>

        {/* Job prefs */}
        <div style={{ padding:'3px 0' }}>
          <div style={{ fontSize:10, color:'var(--t3)', letterSpacing:'.5px', padding:'8px 15px 3px' }}>JOB PREFERENCES</div>
          <div className="s-row" onClick={() => openSheet('location_name', 'Your location', 'text')}>
            <div className="s-icon"><i className="ti ti-map-pin"/></div><div className="s-label">Location</div>
            <span className="s-value">{profile?.location_name || 'Not set'}</span>
            <i className="ti ti-chevron-right" style={{ fontSize:13, color:'var(--t3)' }}/>
          </div>
          <div className="s-row" onClick={() => openSheet('search_radius', 'Search radius', 'select', ['Within 10 miles','Within 25 miles','Within 50 miles','Within 100 miles','Anywhere in my country','Anywhere in the world'])}>
            <div className="s-icon"><i className="ti ti-radar"/></div><div className="s-label">Search radius</div>
            <span className="s-value">{profile?.search_radius || '25 miles'}</span>
            <i className="ti ti-chevron-right" style={{ fontSize:13, color:'var(--t3)' }}/>
          </div>
          <div className="s-row" onClick={() => openSheet('min_salary', 'Minimum salary', 'select', ['£20k+','£30k+','£40k+','£50k+','£60k+','£70k+','£90k+','£120k+'])}>
            <div className="s-icon"><i className="ti ti-currency-pound"/></div><div className="s-label">Minimum salary</div>
            <span className="s-value">{profile?.min_salary || '£50k+'}</span>
            <i className="ti ti-chevron-right" style={{ fontSize:13, color:'var(--t3)' }}/>
          </div>
          <div className="s-row" onClick={() => openSheet('work_style', 'Work style', 'select', ['Any','Hybrid','Remote only','On-site only'])}>
            <div className="s-icon"><i className="ti ti-home"/></div><div className="s-label">Work style</div>
            <span className="s-value">{profile?.work_style || 'Any'}</span>
            <i className="ti ti-chevron-right" style={{ fontSize:13, color:'var(--t3)' }}/>
          </div>
          <div className="s-row">
            <div className="s-icon"><i className="ti ti-eye"/></div>
            <div className="s-label">Open to opportunities</div>
            <Toggle k="open_to_work"/>
          </div>
        </div>

        {/* Notifications */}
        <div style={{ padding:'3px 0' }}>
          <div style={{ fontSize:10, color:'var(--t3)', letterSpacing:'.5px', padding:'8px 15px 3px' }}>NOTIFICATIONS</div>
          <div className="s-row"><div className="s-icon"><i className="ti ti-flame"/></div><div className="s-label">New sparks</div><Toggle k="new_sparks"/></div>
          <div className="s-row"><div className="s-icon"><i className="ti ti-file-text"/></div><div className="s-label">Application updates</div><Toggle k="app_updates"/></div>
          <div className="s-row"><div className="s-icon"><i className="ti ti-message-circle"/></div><div className="s-label">New messages</div><Toggle k="new_messages"/></div>
        </div>

        {/* Support */}
        <div style={{ padding:'3px 0' }}>
          <div style={{ fontSize:10, color:'var(--t3)', letterSpacing:'.5px', padding:'8px 15px 3px' }}>SUPPORT</div>
          <div className="s-row" onClick={() => window.open('mailto:support@flint.app')}>
            <div className="s-icon"><i className="ti ti-help-circle"/></div><div className="s-label">Help & FAQ</div><i className="ti ti-chevron-right" style={{ fontSize:13, color:'var(--t3)' }}/>
          </div>
          <div className="s-row" onClick={() => window.open('https://flint.app/privacy', '_blank')}>
            <div className="s-icon"><i className="ti ti-shield"/></div><div className="s-label">Privacy settings</div><i className="ti ti-chevron-right" style={{ fontSize:13, color:'var(--t3)' }}/>
          </div>
          <div className="s-row" onClick={() => window.open('https://flint.app/terms', '_blank')}>
            <div className="s-icon"><i className="ti ti-file-text"/></div><div className="s-label">Terms of Service</div><i className="ti ti-chevron-right" style={{ fontSize:13, color:'var(--t3)' }}/>
          </div>
        </div>

        {/* Danger */}
        <div style={{ margin:'10px 14px', background:'var(--rd)', border:'0.5px solid var(--rb)', borderRadius:12, overflow:'hidden' }}>
          <div onClick={() => setShowLogout(true)} style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 14px', cursor:'pointer', borderBottom:'0.5px solid var(--rb)' }}>
            <i className="ti ti-logout" style={{ fontSize:16, color:'var(--red)', flexShrink:0 }}/>
            <div><div style={{ fontSize:13, color:'var(--red)', fontWeight:500 }}>Log out</div></div>
          </div>
          <div onClick={() => setShowDelete(true)} style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 14px', cursor:'pointer' }}>
            <i className="ti ti-trash" style={{ fontSize:16, color:'var(--red)', flexShrink:0 }}/>
            <div><div style={{ fontSize:13, color:'var(--red)', fontWeight:500 }}>Delete account</div></div>
          </div>
        </div>
        <div style={{ height:20 }}/>
      </div>

      {/* Quick edit bottom sheet */}
      {sheet && (
        <div className="modal-overlay" onClick={() => setSheet(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{sheet.label}</div>
            <div style={{ marginBottom:14 }}>
              {sheet.type === 'select' ? (
                <select value={sheetValue} onChange={e => setSheetValue(e.target.value)}
                  style={{ width:'100%', background:'var(--bg3)', border:'0.5px solid var(--border)', borderRadius:10, padding:'13px 14px', color:'#fff', fontSize:14, fontFamily:'inherit', outline:'none', cursor:'pointer' }}>
                  {sheet.options.map(o => <option key={o}>{o}</option>)}
                </select>
              ) : sheet.field === 'password' ? (
                <input type="password" value={sheetValue} onChange={e => setSheetValue(e.target.value)}
                  placeholder="New password (min 8 characters)"
                  style={{ width:'100%', background:'var(--bg3)', border:'0.5px solid var(--border)', borderRadius:10, padding:'13px 14px', color:'#fff', fontSize:14, fontFamily:'inherit', outline:'none' }}/>
              ) : (
                <input type="text" value={sheetValue} onChange={e => setSheetValue(e.target.value)}
                  placeholder={sheet.label}
                  style={{ width:'100%', background:'var(--bg3)', border:'0.5px solid var(--border)', borderRadius:10, padding:'13px 14px', color:'#fff', fontSize:14, fontFamily:'inherit', outline:'none' }}/>
              )}
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn-secondary" style={{ flex:1 }} onClick={() => setSheet(null)}>Cancel</button>
              <button className="btn-primary" style={{ flex:2, marginBottom:0 }} onClick={async () => {
                setSaving(true)
                if (sheet.field === 'password') {
                  if (sheetValue.length < 8) { setSaving(false); return }
                  await supabase.auth.updateUser({ password: sheetValue })
                } else {
                  await supabase.from('profiles').update({ [sheet.field]: sheetValue }).eq('id', user.id)
                  await refreshProfile()
                }
                setSaving(false)
                setSheet(null)
              }} disabled={saving}>
                {saving ? <i className="ti ti-loader spin"/> : <i className="ti ti-check"/>} Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showLogout && (
        <div className="modal-overlay" onClick={() => setShowLogout(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Log out?</div>
            <div className="modal-sub">You'll need to sign in again.</div>
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
            <div className="modal-sub">Permanently deletes all your data. You can sign up again with the same email after a few minutes.</div>
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
