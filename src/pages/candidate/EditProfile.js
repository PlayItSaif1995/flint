import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

export default function EditProfile() {
  const nav = useNavigate()
  const location = useLocation()
  const { user, profile, refreshProfile } = useAuth()
  const fromSettings = location.state?.from === 'settings'
  
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    job_title: profile?.job_title || '',
    profession: profile?.profession || '',
    seniority: profile?.seniority || '',
    current_employer: profile?.current_employer || '',
    qualification: profile?.qualification || '',
    bio: profile?.bio || '',
    skills: profile?.skills || '',
    location_name: profile?.location_name || '',
    search_radius: profile?.search_radius || 'Within 25 miles',
    min_salary: profile?.min_salary || '£50k+',
    work_style: profile?.work_style || 'Hybrid',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [cvName, setCvName] = useState(profile?.cv_path ? 'CV uploaded' : '')
  const [uploading, setUploading] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [passwordMsg, setPasswordMsg] = useState('')

  const backPath = fromSettings ? '/settings' : '/profile'

  async function save() {
    setSaving(true)
    await supabase.from('profiles').update(form).eq('id', user.id)
    await refreshProfile()
    setSaving(false)
    setSaved(true)
    setTimeout(() => { setSaved(false); nav(backPath) }, 800)
  }

  async function handleCVUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { alert('File must be under 5MB'); return }
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${user.id}/cv.${ext}`
    const { error } = await supabase.storage.from('cvs').upload(path, file, { upsert: true })
    if (!error) {
      await supabase.from('profiles').update({ cv_path: path }).eq('id', user.id)
      setCvName(file.name)
    }
    setUploading(false)
  }

  async function changePassword() {
    if (newPassword.length < 8) { setPasswordMsg('Password must be at least 8 characters'); return }
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) setPasswordMsg(error.message)
    else { setPasswordMsg('Password updated successfully!'); setNewPassword(''); setShowPasswordForm(false) }
  }

  const inputStyle = { width:'100%', background:'var(--bg3)', border:'0.5px solid var(--border)', borderRadius:10, padding:'11px 13px', color:'#fff', fontSize:13, fontFamily:'inherit', outline:'none' }
  const selectStyle = { ...inputStyle, cursor:'pointer' }
  const labelStyle = { fontSize:10, color:'var(--t3)', letterSpacing:'.5px', marginBottom:5, display:'block' }

  return (
    <>
      <div className="status-bar" style={{ background:'var(--bg2)' }}><span>9:41</span><div className="status-icons"><i className="ti ti-wifi"/><i className="ti ti-battery-2"/></div></div>
      <div className="page-header">
        <button onClick={() => nav(backPath)} style={{ background:'none', border:'none', cursor:'pointer' }}>
          <i className="ti ti-arrow-left" style={{ fontSize:18, color:'var(--t2)' }}/>
        </button>
        <h1>Edit profile</h1>
        <button onClick={save} style={{ background:'none', border:'none', cursor:'pointer', fontSize:13, color:'var(--spark)', fontFamily:'inherit', fontWeight:500 }}>
          {saving ? '...' : saved ? '✓ Saved' : 'Save'}
        </button>
      </div>
      <div className="scroll" style={{ background:'var(--bg)', padding:14 }}>

        {/* Personal */}
        <div style={{ fontSize:10, color:'var(--t3)', letterSpacing:'.5px', marginBottom:8 }}>PERSONAL INFO</div>
        <div style={{ marginBottom:10 }}><label style={labelStyle}>FULL NAME</label><input value={form.full_name} onChange={e => setForm({...form, full_name:e.target.value})} placeholder="Your full name" style={inputStyle}/></div>
        <div style={{ marginBottom:10 }}><label style={labelStyle}>JOB TITLE</label><input value={form.job_title} onChange={e => setForm({...form, job_title:e.target.value})} placeholder="e.g. Senior Civil Engineer" style={inputStyle}/></div>
        <div style={{ marginBottom:10 }}><label style={labelStyle}>CURRENT EMPLOYER</label><input value={form.current_employer} onChange={e => setForm({...form, current_employer:e.target.value})} placeholder="Where you currently work" style={inputStyle}/></div>
        <div style={{ marginBottom:10 }}>
          <label style={labelStyle}>QUALIFICATION</label>
          <select value={form.qualification} onChange={e => setForm({...form, qualification:e.target.value})} style={selectStyle}>
            <option value="">Select qualification</option>
            {['GCSE / O-Level','A-Levels / IB','HNC / HND','Foundation Degree','Bachelor\'s Degree','Master\'s Degree','PhD / Doctorate','Professional Qualification (e.g. RICS, ACA)','Apprenticeship','Other'].map(q => <option key={q}>{q}</option>)}
          </select>
        </div>
        <div style={{ marginBottom:10 }}>
          <label style={labelStyle}>BIO</label>
          <textarea value={form.bio} onChange={e => setForm({...form, bio:e.target.value})} placeholder="What are you looking for next?" maxLength={200} style={{ ...inputStyle, resize:'none', height:80 }}/>
          <div style={{ fontSize:10, color:'var(--t3)', textAlign:'right', marginTop:3 }}>{form.bio.length}/200</div>
        </div>
        <div style={{ marginBottom:14 }}><label style={labelStyle}>SKILLS (comma separated)</label><input value={form.skills} onChange={e => setForm({...form, skills:e.target.value})} placeholder="e.g. AutoCAD, Civil 3D, BIM" style={inputStyle}/></div>

        {/* CV Upload */}
        <div style={{ fontSize:10, color:'var(--t3)', letterSpacing:'.5px', marginBottom:8 }}>CV</div>
        <input type="file" id="cv-edit" accept=".pdf,.doc,.docx" style={{ display:'none' }} onChange={handleCVUpload}/>
        <div onClick={() => document.getElementById('cv-edit').click()} style={{ background: cvName ? 'var(--gd)' : 'var(--bg3)', border: `0.5px ${cvName ? 'solid var(--gb)' : 'dashed var(--border2)'}`, borderRadius:10, padding:'12px 14px', display:'flex', alignItems:'center', gap:10, cursor:'pointer', marginBottom:14 }}>
          {uploading ? <i className="ti ti-loader spin" style={{ fontSize:18, color:'var(--spark)' }}/> : <i className={`ti ${cvName ? 'ti-circle-check' : 'ti-file-upload'}`} style={{ fontSize:18, color: cvName ? 'var(--green)' : 'var(--t3)' }}/>}
          <div>
            <div style={{ fontSize:13, color: cvName ? 'var(--green)' : 'var(--t3)', fontWeight:500 }}>{uploading ? 'Uploading...' : cvName || 'Upload CV'}</div>
            <div style={{ fontSize:10, color:'var(--t3)' }}>PDF or Word, max 5MB · Tap to {cvName ? 'replace' : 'upload'}</div>
          </div>
        </div>

        {/* Job preferences */}
        <div style={{ fontSize:10, color:'var(--t3)', letterSpacing:'.5px', marginBottom:8 }}>JOB PREFERENCES</div>
        <div style={{ marginBottom:10 }}><label style={labelStyle}>LOCATION</label><input value={form.location_name} onChange={e => setForm({...form, location_name:e.target.value})} placeholder="e.g. London, UK" style={inputStyle}/></div>
        <div style={{ marginBottom:10 }}>
          <label style={labelStyle}>SEARCH RADIUS</label>
          <select value={form.search_radius} onChange={e => setForm({...form, search_radius:e.target.value})} style={selectStyle}>
            {['Within 10 miles','Within 25 miles','Within 50 miles','Within 100 miles','Anywhere in my country','Anywhere in the world'].map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div style={{ marginBottom:10 }}>
          <label style={labelStyle}>MINIMUM SALARY</label>
          <select value={form.min_salary} onChange={e => setForm({...form, min_salary:e.target.value})} style={selectStyle}>
            {['£20k+','£30k+','£40k+','£50k+','£60k+','£70k+','£90k+','£120k+'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={labelStyle}>WORK STYLE</label>
          <select value={form.work_style} onChange={e => setForm({...form, work_style:e.target.value})} style={selectStyle}>
            {['Any','Hybrid','Remote only','On-site only'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* Password change */}
        <div style={{ fontSize:10, color:'var(--t3)', letterSpacing:'.5px', marginBottom:8 }}>SECURITY</div>
        <div style={{ background:'var(--bg2)', border:'0.5px solid var(--border)', borderRadius:10, overflow:'hidden', marginBottom:14 }}>
          <div onClick={() => setShowPasswordForm(!showPasswordForm)} style={{ padding:'12px 14px', display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
            <i className="ti ti-lock" style={{ fontSize:15, color:'var(--t2)' }}/>
            <span style={{ fontSize:13, color:'#ddd', flex:1 }}>Change password</span>
            <i className={`ti ti-chevron-${showPasswordForm ? 'up' : 'down'}`} style={{ fontSize:13, color:'var(--t3)' }}/>
          </div>
          {showPasswordForm && (
            <div style={{ padding:'0 14px 14px', borderTop:'0.5px solid var(--border)' }}>
              <div style={{ marginBottom:8, marginTop:10 }}>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password (min 8 characters)" style={{ ...inputStyle, marginBottom:0 }}/>
              </div>
              {passwordMsg && <p style={{ fontSize:11, color: passwordMsg.includes('success') ? 'var(--green)' : 'var(--red)', marginBottom:8 }}>{passwordMsg}</p>}
              <button className="btn-sm primary" onClick={changePassword} style={{ width:'100%', justifyContent:'center', padding:'10px' }}>
                <i className="ti ti-check"/> Update password
              </button>
            </div>
          )}
        </div>

        <button className="btn-primary" onClick={save} disabled={saving}>
          {saving ? <i className="ti ti-loader spin"/> : <i className="ti ti-circle-check"/>} {saving ? 'Saving...' : saved ? 'Saved!' : 'Save changes'}
        </button>
        <div style={{ height:20 }}/>
      </div>
    </>
  )
}
