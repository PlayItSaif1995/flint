import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

export default function CandCV() {
  const nav = useNavigate()
  const { user } = useAuth()
  const [bio, setBio] = useState('')
  const [cvName, setCvName] = useState('')
  const [uploading, setUploading] = useState(false)

  async function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${user.id}/cv.${ext}`
    const { error } = await supabase.storage.from('cvs').upload(path, file, { upsert: true })
    if (!error) {
      setCvName(file.name)
      await supabase.from('profiles').upsert({ id: user.id, cv_path: path })
    }
    setUploading(false)
  }

  async function continueOn() {
    await supabase.from('profiles').upsert({ id: user.id, bio })
    nav('/onboarding/location')
  }

  return (
    <>
      <div className="status-bar"><span>9:41</span><div className="status-icons"><i className="ti ti-wifi"/><i className="ti ti-battery-2"/></div></div>
      <div className="ob-wrap">
        <button className="back-btn" onClick={() => nav('/onboarding/profession')}><i className="ti ti-arrow-left"/> Back</button>
        <div className="ob-progress"><div className="ob-step done"/><div className="ob-step done"/><div className="ob-step done"/><div className="ob-step"/></div>
        <div className="ob-h">Upload your CV</div>
        <div className="ob-sub">Upload once. We match you automatically from here on.</div>

        <input type="file" id="cv-upload" accept=".pdf,.doc,.docx" style={{ display:'none' }} onChange={handleFileChange}/>
        {cvName ? (
          <div style={{ background:'var(--gd)', border:'0.5px solid var(--gb)', borderRadius:12, height:52, display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:12, cursor:'pointer' }} onClick={() => document.getElementById('cv-upload').click()}>
            <i className="ti ti-circle-check" style={{ fontSize:17, color:'var(--green)' }}/>
            <span style={{ fontSize:13, color:'var(--green)', fontWeight:500 }}>{cvName}</span>
          </div>
        ) : (
          <div onClick={() => document.getElementById('cv-upload').click()} style={{ background:'var(--bg3)', border:'0.5px dashed var(--border2)', borderRadius:13, height:110, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:7, marginBottom:12, cursor:'pointer' }}>
            {uploading ? <i className="ti ti-loader spin" style={{ fontSize:26, color:'var(--t3)' }}/> : <i className="ti ti-file-upload" style={{ fontSize:26, color:'var(--t3)' }}/>}
            <span style={{ fontSize:13, color:'var(--t3)' }}>{uploading ? 'Uploading...' : 'Tap to upload CV or LinkedIn export'}</span>
          </div>
        )}

        <textarea className="bio" placeholder="Short bio — what are you looking for next?" maxLength={200} value={bio} onChange={e => setBio(e.target.value)}
          style={{ width:'100%', background:'var(--bg3)', border:'0.5px solid var(--border)', borderRadius:11, padding:'11px 13px', color:'#fff', fontSize:12, fontFamily:'inherit', resize:'none', outline:'none', height:70, marginBottom:4 }}/>
        <div style={{ fontSize:10, color:'var(--t3)', textAlign:'right', marginBottom:10 }}>{bio.length} / 200</div>

        <div style={{ marginTop:'auto' }}>
          <button className="btn-primary" onClick={continueOn}>Continue <i className="ti ti-arrow-right"/></button>
        </div>
      </div>
    </>
  )
}
