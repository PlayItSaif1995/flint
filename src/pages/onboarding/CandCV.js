import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

export default function CandCV() {
  const nav = useNavigate()
  const { user, profile } = useAuth()
  const [bio, setBio] = useState('')
  const [cvName, setCvName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  function goBack() {
    if (profile?.onboarded) nav('/settings')
    else nav('/onboarding/profession')
  }

  async function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!validTypes.includes(file.type)) {
      setUploadError('Please upload a PDF or Word document')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File must be under 5MB')
      return
    }

    setUploading(true)
    setUploadError('')
    const ext = file.name.split('.').pop()
    const path = `${user.id}/cv.${ext}`
    
    const { error } = await supabase.storage.from('cvs').upload(path, file, { upsert: true })
    if (error) {
      setUploadError('Upload failed. Please try again.')
      setUploading(false)
      return
    }
    
    await supabase.from('profiles').upsert({ id: user.id, cv_path: path })
    setCvName(file.name)
    setUploading(false)
  }

  async function continueOn() {
    if (bio) await supabase.from('profiles').upsert({ id: user.id, bio })
    nav('/onboarding/location')
  }

  return (
    <>
      <div className="status-bar"><span>9:41</span><div className="status-icons"><i className="ti ti-wifi"/><i className="ti ti-battery-2"/></div></div>
      <div className="ob-wrap">
        <button className="back-btn" onClick={goBack}><i className="ti ti-arrow-left"/> Back</button>
        <div className="ob-progress"><div className="ob-step done"/><div className="ob-step done"/><div className="ob-step done"/><div className="ob-step"/></div>
        <div className="ob-h">Upload your CV</div>
        <div className="ob-sub">Upload once. We match you automatically from here on.</div>

        <input type="file" id="cv-upload" accept=".pdf,.doc,.docx" style={{ display:'none' }} onChange={handleFileChange}/>
        
        {cvName ? (
          <div style={{ background:'var(--gd)', border:'0.5px solid var(--gb)', borderRadius:12, padding:'14px 16px', display:'flex', alignItems:'center', gap:10, marginBottom:12, cursor:'pointer' }} onClick={() => document.getElementById('cv-upload').click()}>
            <i className="ti ti-circle-check" style={{ fontSize:20, color:'var(--green)', flexShrink:0 }}/>
            <div>
              <div style={{ fontSize:13, color:'var(--green)', fontWeight:500 }}>CV uploaded successfully</div>
              <div style={{ fontSize:11, color:'var(--t2)', marginTop:2 }}>{cvName}</div>
            </div>
            <button style={{ marginLeft:'auto', background:'none', border:'none', fontSize:11, color:'var(--t2)', cursor:'pointer', fontFamily:'inherit' }}>Change</button>
          </div>
        ) : (
          <div onClick={() => document.getElementById('cv-upload').click()} style={{ background:'var(--bg3)', border:'0.5px dashed var(--border2)', borderRadius:13, height:110, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:7, marginBottom:12, cursor:'pointer' }}>
            {uploading
              ? <><i className="ti ti-loader spin" style={{ fontSize:26, color:'var(--spark)' }}/><span style={{ fontSize:13, color:'var(--t2)' }}>Uploading...</span></>
              : <><i className="ti ti-file-upload" style={{ fontSize:26, color:'var(--t3)' }}/><span style={{ fontSize:13, color:'var(--t3)' }}>Tap to upload CV</span><span style={{ fontSize:11, color:'var(--t3)' }}>PDF or Word, max 5MB</span></>
            }
          </div>
        )}
        
        {uploadError && <p style={{ fontSize:12, color:'var(--red)', marginBottom:10, marginTop:-4 }}>{uploadError}</p>}

        <div style={{ background:'var(--bg2)', border:'0.5px solid var(--border)', borderRadius:10, padding:'10px 12px', marginBottom:12, display:'flex', gap:8, alignItems:'flex-start' }}>
          <i className="ti ti-info-circle" style={{ fontSize:13, color:'var(--t3)', flexShrink:0, marginTop:1 }}/>
          <p style={{ fontSize:11, color:'var(--t3)', lineHeight:1.5 }}>Don't have a CV? You can skip this and add one later from your profile settings.</p>
        </div>

        <textarea placeholder="Short bio — what are you looking for next? (optional)" maxLength={200} value={bio} onChange={e => setBio(e.target.value)}
          style={{ width:'100%', background:'var(--bg3)', border:'0.5px solid var(--border)', borderRadius:11, padding:'11px 13px', color:'#fff', fontSize:12, fontFamily:'inherit', resize:'none', outline:'none', height:70, marginBottom:4 }}/>
        <div style={{ fontSize:10, color:'var(--t3)', textAlign:'right', marginBottom:14 }}>{bio.length} / 200</div>

        <div style={{ marginTop:'auto' }}>
          <button className="btn-primary" onClick={continueOn}>Continue <i className="ti ti-arrow-right"/></button>
        </div>
      </div>
    </>
  )
}
