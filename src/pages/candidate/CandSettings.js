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
  const [cvUploading, setCvUploading] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || null)
  const [cvFilename, setCvFilename] = useState(profile?.cv_filename || null)
  const [cvPath, setCvPath] = useState(profile?.cv_path || null)
  const [sheet, setSheet] = useState(null)
  const [currentPassword, setCurrentPassword] = useState('')
  const [sheetError, setSheetError] = useState('')
  const [confirmValue, setConfirmValue] = useState('')
  const [locationCountry, setLocationCountry] = useState('')
  const [locationCity, setLocationCity] = useState('')
  const [countries, setCountries] = useState([])
  const [cities, setCities] = useState([])
  const [loadingCities, setLoadingCities] = useState(false)

  async function handleCVUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { alert('File must be under 5MB'); return }
    setCvUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${user.id}/cv_${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('cvs').upload(path, file, { upsert: true })
    if (!error) {
      await supabase.from('profiles').update({ cv_path: path, cv_filename: file.name }).eq('id', user.id)
      setCvFilename(file.name)
      setCvPath(path)
      await refreshProfile()
    } else {
      console.error('CV upload error:', error)
      alert('Upload failed. Please try again.')
    }
    setCvUploading(false)
  }

  async function handleAvatarUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 3 * 1024 * 1024) { alert('Image must be under 3MB'); return }
    setAvatarUploading(true)
    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
    const path = `${user.id}/avatar_${Date.now()}.${ext}`
    
    const { data: uploadData, error } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type })
    
    if (error) {
      console.error('Avatar upload error:', error)
      alert('Upload failed: ' + error.message)
      setAvatarUploading(false)
      return
    }

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
    const publicUrl = urlData.publicUrl
    
    console.log('Avatar URL:', publicUrl)
    
    const { error: updateError } = await supabase.from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id)
    
    if (updateError) {
      console.error('Profile update error:', updateError)
    }
    
    setAvatarUrl(publicUrl)
    setAvatarUploading(false)
    // Reload to persist across pages
    setTimeout(() => window.location.reload(), 300)
  } // { field, label, type, options, value }
  const [sheetValue, setSheetValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [notifs, setNotifs] = useState({ new_sparks:true, app_updates:true, new_messages:true, open_to_work:true })
  const hasEmpProfile = profile?.has_employer_profile

  useEffect(() => {
    if (profile?.notification_prefs) {
      try { setNotifs({ ...notifs, ...JSON.parse(profile.notification_prefs) }) } catch {}
    }
    // Load all countries
    fetch('https://countriesnow.space/api/v0.1/countries/positions')
      .then(r => r.json())
      .then(d => setCountries((d.data || []).map(c => c.name).sort()))
      .catch(() => {})
  }, [profile])

  function openSheet(field, label, type, options = null) {
    const current = profile?.[field] || ''
    setSheet({ field, label, type, options })
    setSheetValue(current)
    setSheetError('')
    if (field === 'location_name') detectLocation()
  }

  async function handleCountryChange(country) {
    setLocationCountry(country)
    setLocationCity('')
    setCities([])
    if (!country) return
    setLoadingCities(true)
    try {
      const r = await fetch('https://countriesnow.space/api/v0.1/countries/cities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country })
      })
      const d = await r.json()
      setCities((d.data || []).sort())
    } catch {}
    setLoadingCities(false)
  }

  async function detectLocation() {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(async pos => {
      const { latitude, longitude } = pos.coords
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
        const d = await r.json()
        const a = d.address
        const city = a.city || a.town || a.village || a.county || ''
        const country = a.country || ''
        setSheetValue(city ? `${city}, ${country}` : country)
        await supabase.from('profiles').update({ lat: latitude, lon: longitude }).eq('id', user.id)
      } catch {}
    }, () => {})
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
    if (key === 'open_to_work') {
      // Save directly to profiles column so headhunt can filter on it
      await supabase.from('profiles').update({ open_to_work: updated[key] }).eq('id', user.id)
    }
    await supabase.from('profiles').update({ notification_prefs: JSON.stringify(updated) }).eq('id', user.id)
  }

  function Toggle({ k }) {
    return <button className={`toggle ${notifs[k] ? 'on' : ''}`} onClick={() => toggleNotif(k)}/>
  }

  return (
    <>
      <div className="status-bar" style={{ background:'var(--bg2)' }}><span>9:41</span><div className="status-icons"><i className="ti ti-wifi"/><i className="ti ti-battery-2"/></div></div>
      <div className="page-header">
        <h1>Profile</h1>
        <button onClick={() => nav('/profile')} style={{ background:'none', border:'none', cursor:'pointer' }}>
          <i className="ti ti-chart-bar" style={{ fontSize:18, color:'var(--t2)' }}/>
        </button>
      </div>

      <div className="scroll" style={{ background:'var(--bg)' }}>
        {/* Hero */}
        <div style={{ padding:16, display:'flex', flexDirection:'column', alignItems:'center', gap:5, borderBottom:'0.5px solid var(--border)', background:'var(--bg2)' }}>
          <input type="file" id="avatar-upload" accept="image/jpeg,image/png,image/webp" style={{ display:'none' }} onChange={handleAvatarUpload}/>
          <div onClick={() => document.getElementById('avatar-upload').click()} style={{ width:68, height:68, borderRadius:'50%', background:'var(--spark)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:21, fontWeight:500, color:'#000', cursor:'pointer', position:'relative', overflow:'hidden' }}>
            {avatarUrl
              ? <img src={avatarUrl} alt="avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
              : (profile?.full_name || 'U').split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()
            }
            {avatarUploading && (
              <div style={{ position:'absolute', inset:0, background:'#000a', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <i className="ti ti-loader spin" style={{ fontSize:18, color:'#fff' }}/>
              </div>
            )}
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

        {/* Profile */}
        <div style={{ padding:'3px 0' }}>
          <div style={{ fontSize:10, color:'var(--t3)', letterSpacing:'.5px', padding:'8px 15px 3px' }}>PROFILE</div>
          <div className="s-row" onClick={() => openSheet('full_name', 'Full name', 'text')}>
            <div className="s-icon sp"><i className="ti ti-user"/></div>
            <div className="s-label">Full name</div>
            <span className="s-value">{profile?.full_name || 'Not set'}</span>
            <i className="ti ti-chevron-right" style={{ fontSize:13, color:'var(--t3)' }}/>
          </div>
          <div className="s-row" onClick={() => openSheet('job_title', 'Job title', 'text')}>
            <div className="s-icon"><i className="ti ti-briefcase"/></div>
            <div className="s-label">Job title</div>
            <span className="s-value">{profile?.job_title || 'Not set'}</span>
            <i className="ti ti-chevron-right" style={{ fontSize:13, color:'var(--t3)' }}/>
          </div>
          <div className="s-row" onClick={() => openSheet('current_employer', 'Current employer', 'text')}>
            <div className="s-icon"><i className="ti ti-building"/></div>
            <div className="s-label">Current employer</div>
            <span className="s-value">{profile?.current_employer || 'Not set'}</span>
            <i className="ti ti-chevron-right" style={{ fontSize:13, color:'var(--t3)' }}/>
          </div>
          <div className="s-row" onClick={() => openSheet('qualification', 'Qualification', 'select', ['GCSE / O-Level','A-Levels / IB','HNC / HND','Foundation Degree',"Bachelor's Degree","Master's Degree",'PhD / Doctorate','Professional Qualification (e.g. RICS, ACA)','Apprenticeship','Other'])}>
            <div className="s-icon"><i className="ti ti-school"/></div>
            <div className="s-label">Qualification</div>
            <span className="s-value">{profile?.qualification || 'Not set'}</span>
            <i className="ti ti-chevron-right" style={{ fontSize:13, color:'var(--t3)' }}/>
          </div>
          <div className="s-row" onClick={() => openSheet('skills', 'Skills', 'text')}>
            <div className="s-icon"><i className="ti ti-tools"/></div>
            <div className="s-label">Skills</div>
            <span className="s-value" style={{ maxWidth:120, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{profile?.skills || 'Not set'}</span>
            <i className="ti ti-chevron-right" style={{ fontSize:13, color:'var(--t3)' }}/>
          </div>
          <div className="s-row" onClick={() => openSheet('bio', 'Bio', 'textarea')}>
            <div className="s-icon"><i className="ti ti-notes"/></div>
            <div className="s-label">Bio</div>
            <span className="s-value" style={{ maxWidth:120, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{profile?.bio || 'Not set'}</span>
            <i className="ti ti-chevron-right" style={{ fontSize:13, color:'var(--t3)' }}/>
          </div>

          {/* CV inline in profile section */}
          <input type="file" id="cv-settings-upload" accept=".pdf,.doc,.docx" style={{ display:'none' }} onChange={handleCVUpload}/>
          {cvPath || profile?.cv_path ? (
            <div style={{ display:'flex', alignItems:'center', borderBottom:'0.5px solid var(--border)' }}>
              <div className="s-row" style={{ flex:1, borderBottom:'none' }} onClick={() => document.getElementById('cv-settings-upload').click()}>
                <div className="s-icon gr"><i className="ti ti-file-cv"/></div>
                <div style={{ flex:1 }}>
                  <div className="s-label">CV</div>
                  <div style={{ fontSize:10, color:'var(--t3)', marginTop:1 }}>{cvFilename || profile?.cv_filename || 'Tap to replace'}</div>
                </div>
                <span className="s-value" style={{ color:'var(--green)' }}>✓</span>
              </div>
              <button onClick={async () => {
                const activePath = cvPath || profile?.cv_path
                const { data } = supabase.storage.from('cvs').getPublicUrl(activePath)
                window.open(data.publicUrl + '?t=' + Date.now(), '_blank')
              }} style={{ background:'none', border:'none', padding:'0 14px', cursor:'pointer', flexShrink:0 }}>
                <i className="ti ti-eye" style={{ fontSize:16, color:'var(--spark)' }}/>
              </button>
            </div>
          ) : (
            <div className="s-row" onClick={() => document.getElementById('cv-settings-upload').click()}>
              <div className="s-icon"><i className="ti ti-file-cv"/></div>
              <div className="s-label">CV</div>
              <span className="s-value" style={{ color: cvUploading ? 'var(--spark)' : 'var(--t3)' }}>{cvUploading ? 'Uploading...' : 'Not uploaded'}</span>
              <i className="ti ti-chevron-right" style={{ fontSize:13, color:'var(--t3)' }}/>
            </div>
          )}
        </div>

        {/* Account */}
        <div style={{ padding:'3px 0' }}>
          <div style={{ fontSize:10, color:'var(--t3)', letterSpacing:'.5px', padding:'8px 15px 3px' }}>ACCOUNT</div>
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
        <div className="modal-overlay" onClick={() => { setSheet(null); setCurrentPassword(''); setSheetError(''); setConfirmValue('') }}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{sheet.label}</div>

            {/* EMAIL CHANGE */}
            {sheet.field === 'email' && (
              <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:10 }}>
                <div>
                  <div style={{ fontSize:10, color:'var(--t3)', letterSpacing:'.5px', marginBottom:5 }}>CURRENT PASSWORD</div>
                  <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Your current password"
                    style={{ width:'100%', background:'var(--bg3)', border:'0.5px solid var(--border)', borderRadius:10, padding:'12px 14px', color:'#fff', fontSize:13, fontFamily:'inherit', outline:'none' }}/>
                </div>
                <div>
                  <div style={{ fontSize:10, color:'var(--t3)', letterSpacing:'.5px', marginBottom:5 }}>NEW EMAIL ADDRESS</div>
                  <input type="email" value={sheetValue} onChange={e => setSheetValue(e.target.value)} placeholder="New email address"
                    style={{ width:'100%', background:'var(--bg3)', border:'0.5px solid var(--border)', borderRadius:10, padding:'12px 14px', color:'#fff', fontSize:13, fontFamily:'inherit', outline:'none' }}/>
                </div>
                <div>
                  <div style={{ fontSize:10, color:'var(--t3)', letterSpacing:'.5px', marginBottom:5 }}>CONFIRM NEW EMAIL</div>
                  <input type="email" value={confirmValue} onChange={e => setConfirmValue(e.target.value)} placeholder="Re-enter new email address"
                    style={{ width:'100%', background:'var(--bg3)', border:`0.5px solid ${confirmValue && confirmValue !== sheetValue ? 'var(--red)' : 'var(--border)'}`, borderRadius:10, padding:'12px 14px', color:'#fff', fontSize:13, fontFamily:'inherit', outline:'none' }}/>
                  {confirmValue && confirmValue !== sheetValue && <p style={{ fontSize:11, color:'var(--red)', marginTop:4 }}>Emails don't match</p>}
                </div>
              </div>
            )}

            {/* PASSWORD CHANGE */}
            {sheet.field === 'password' && (
              <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:10 }}>
                <div>
                  <div style={{ fontSize:10, color:'var(--t3)', letterSpacing:'.5px', marginBottom:5 }}>CURRENT PASSWORD</div>
                  <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Your current password"
                    style={{ width:'100%', background:'var(--bg3)', border:'0.5px solid var(--border)', borderRadius:10, padding:'12px 14px', color:'#fff', fontSize:13, fontFamily:'inherit', outline:'none' }}/>
                </div>
                <div>
                  <div style={{ fontSize:10, color:'var(--t3)', letterSpacing:'.5px', marginBottom:5 }}>NEW PASSWORD</div>
                  <input type="password" value={sheetValue} onChange={e => setSheetValue(e.target.value)} placeholder="New password (min 8 characters)"
                    style={{ width:'100%', background:'var(--bg3)', border:'0.5px solid var(--border)', borderRadius:10, padding:'12px 14px', color:'#fff', fontSize:13, fontFamily:'inherit', outline:'none' }}/>
                  {sheetValue && sheetValue.length < 8 && <p style={{ fontSize:11, color:'var(--red)', marginTop:4 }}>Must be at least 8 characters</p>}
                </div>
                <div>
                  <div style={{ fontSize:10, color:'var(--t3)', letterSpacing:'.5px', marginBottom:5 }}>CONFIRM NEW PASSWORD</div>
                  <input type="password" value={confirmValue} onChange={e => setConfirmValue(e.target.value)} placeholder="Re-enter new password"
                    style={{ width:'100%', background:'var(--bg3)', border:`0.5px solid ${confirmValue && confirmValue !== sheetValue ? 'var(--red)' : 'var(--border)'}`, borderRadius:10, padding:'12px 14px', color:'#fff', fontSize:13, fontFamily:'inherit', outline:'none' }}/>
                  {confirmValue && confirmValue !== sheetValue && <p style={{ fontSize:11, color:'var(--red)', marginTop:4 }}>Passwords don't match</p>}
                </div>
              </div>
            )}

            {/* ALL OTHER FIELDS */}
            {sheet.field !== 'email' && sheet.field !== 'password' && (
              <div style={{ marginBottom:10 }}>
                {sheet.type === 'select' ? (
                  <select value={sheetValue} onChange={e => setSheetValue(e.target.value)}
                    style={{ width:'100%', background:'var(--bg3)', border:'0.5px solid var(--border)', borderRadius:10, padding:'13px 14px', color:'#fff', fontSize:14, fontFamily:'inherit', outline:'none', cursor:'pointer' }}>
                    {sheet.options.map(o => <option key={o}>{o}</option>)}
                  </select>
                ) : sheet.field === 'location_name' ? (
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    <div style={{ background: sheetValue ? 'var(--gd)' : 'var(--bg3)', border:`0.5px solid ${sheetValue ? 'var(--gb)' : 'var(--border)'}`, borderRadius:10, padding:'12px 14px', display:'flex', alignItems:'center', gap:10 }}>
                      <i className={`ti ${sheetValue ? 'ti-map-pin-check' : 'ti-map-pin'}`} style={{ fontSize:16, color: sheetValue ? 'var(--green)' : 'var(--t3)', flexShrink:0 }}/>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, color: sheetValue ? '#fff' : 'var(--t3)' }}>{sheetValue || 'No location set'}</div>
                      </div>
                    </div>
                    <button onClick={detectLocation} style={{ width:'100%', background:'var(--spark)', border:'none', borderRadius:10, padding:'11px 14px', color:'#000', fontSize:13, fontWeight:600, fontFamily:'inherit', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}>
                      <i className="ti ti-map-pin"/> Use my current location
                    </button>
                    <div style={{ fontSize:10, color:'var(--t3)', textAlign:'center' }}>— or select manually —</div>
                    <select value={locationCountry} onChange={e => handleCountryChange(e.target.value)}
                      style={{ width:'100%', background:'var(--bg3)', border:'0.5px solid var(--border)', borderRadius:10, padding:'11px 14px', color: locationCountry ? '#fff' : 'var(--t3)', fontSize:13, fontFamily:'inherit', outline:'none', cursor:'pointer' }}>
                      <option value="">Select country...</option>
                      {countries.map(c => <option key={c}>{c}</option>)}
                    </select>
                    {locationCountry && (
                      <select value={locationCity} onChange={e => { setLocationCity(e.target.value); setSheetValue(`${e.target.value}, ${locationCountry}`) }}
                        style={{ width:'100%', background:'var(--bg3)', border:'0.5px solid var(--border)', borderRadius:10, padding:'11px 14px', color: locationCity ? '#fff' : 'var(--t3)', fontSize:13, fontFamily:'inherit', outline:'none', cursor:'pointer' }}
                        disabled={loadingCities}>
                        <option value="">{loadingCities ? 'Loading cities...' : 'Select city...'}</option>
                        {cities.map(c => <option key={c}>{c}</option>)}
                      </select>
                    )}
                  </div>
                ) : sheet.type === 'textarea' ? (
                  <div>
                    <textarea value={sheetValue} onChange={e => setSheetValue(e.target.value)} placeholder={sheet.label} maxLength={200}
                      style={{ width:'100%', background:'var(--bg3)', border:'0.5px solid var(--border)', borderRadius:10, padding:'13px 14px', color:'#fff', fontSize:14, fontFamily:'inherit', outline:'none', resize:'none', height:100 }}/>
                    <div style={{ fontSize:10, color:'var(--t3)', textAlign:'right', marginTop:3 }}>{sheetValue.length}/200</div>
                  </div>
                ) : (
                  <input type="text" value={sheetValue} onChange={e => setSheetValue(e.target.value)} placeholder={sheet.label}
                    style={{ width:'100%', background:'var(--bg3)', border:'0.5px solid var(--border)', borderRadius:10, padding:'13px 14px', color:'#fff', fontSize:14, fontFamily:'inherit', outline:'none' }}/>
                )}
              </div>
            )}

            {sheetError && <p style={{ fontSize:12, color:'var(--red)', marginBottom:10 }}>{sheetError}</p>}

            <div style={{ display:'flex', gap:8 }}>
              <button className="btn-secondary" style={{ flex:1 }} onClick={() => { setSheet(null); setCurrentPassword(''); setSheetError(''); setConfirmValue('') }}>Cancel</button>
              <button className="btn-primary" style={{ flex:2, marginBottom:0 }} onClick={async () => {
                setSheetError('')

                if (sheet.field === 'password') {
                  if (!currentPassword) { setSheetError('Enter your current password'); return }
                  if (sheetValue.length < 8) { setSheetError('New password must be at least 8 characters'); return }
                  if (sheetValue !== confirmValue) { setSheetError("Passwords don't match"); return }
                  setSaving(true)
                  const { error: authErr } = await supabase.auth.signInWithPassword({ email: profile?.email || user?.email, password: currentPassword })
                  if (authErr) { setSheetError('Current password is incorrect'); setSaving(false); return }
                  const { error } = await supabase.auth.updateUser({ password: sheetValue })
                  setSaving(false)
                  if (error) setSheetError(error.message)
                  else { setSheet(null); setCurrentPassword(''); setConfirmValue('') }
                  return
                }

                if (sheet.field === 'email') {
                  if (!currentPassword) { setSheetError('Enter your current password'); return }
                  if (!sheetValue.includes('@')) { setSheetError('Enter a valid email address'); return }
                  if (sheetValue !== confirmValue) { setSheetError("Email addresses don't match"); return }
                  setSaving(true)
                  const { error: authErr } = await supabase.auth.signInWithPassword({ email: profile?.email || user?.email, password: currentPassword })
                  if (authErr) { setSheetError('Current password is incorrect'); setSaving(false); return }
                  const { error } = await supabase.auth.updateUser({ email: sheetValue })
                  setSaving(false)
                  if (error) setSheetError(error.message)
                  else {
                    await supabase.from('profiles').update({ email: sheetValue }).eq('id', user.id)
                    setSheet(null); setCurrentPassword(''); setConfirmValue('')
                  }
                  return
                }

                // Non-sensitive fields
                setSaving(true)
                await supabase.from('profiles').update({ [sheet.field]: sheetValue }).eq('id', user.id)
                await refreshProfile()
                setSaving(false)
                setSheet(null)
              }} disabled={saving || (sheet.field !== 'password' && sheet.field !== 'email' ? false : !currentPassword || !sheetValue || sheetValue !== confirmValue)}>
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
