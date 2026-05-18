import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

export default function EditProfile() {
  const nav = useNavigate()
  const { user, profile, refreshProfile } = useAuth()
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
    search_radius: profile?.search_radius || 'Within 25 miles of my location',
    min_salary: profile?.min_salary || '£50k+',
    work_style: profile?.work_style || 'Hybrid',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function save() {
    setSaving(true)
    await supabase.from('profiles').update(form).eq('id', user.id)
    await refreshProfile()
    setSaving(false)
    setSaved(true)
    setTimeout(() => nav('/settings'), 800)
  }

  const F = ({ label, field, type='text', placeholder='' }) => (
    <div style={{ marginBottom:12 }}>
      <div style={{ fontSize:10, color:'var(--t3)', letterSpacing:'.5px', marginBottom:5 }}>{label}</div>
      <input type={type} value={form[field]} onChange={e => setForm({...form, [field]:e.target.value})} placeholder={placeholder}
        style={{ width:'100%', background:'var(--bg3)', border:'0.5px solid var(--border)', borderRadius:10, padding:'11px 13px', color:'#fff', fontSize:13, fontFamily:'inherit', outline:'none' }}/>
    </div>
  )

  return (
    <>
      <div className="status-bar" style={{ background:'var(--bg2)' }}><span>9:41</span><div className="status-icons"><i className="ti ti-wifi"/><i className="ti ti-battery-2"/></div></div>
      <div className="page-header">
        <button onClick={() => nav('/settings')} style={{ background:'none', border:'none', cursor:'pointer' }}><i className="ti ti-arrow-left" style={{ fontSize:18, color:'var(--t2)' }}/></button>
        <h1>Edit profile</h1>
        <button onClick={save} style={{ background:'none', border:'none', cursor:'pointer', fontSize:13, color:'var(--spark)', fontFamily:'inherit', fontWeight:500 }}>{saving ? '...' : saved ? '✓' : 'Save'}</button>
      </div>
      <div className="scroll" style={{ background:'var(--bg)', padding:14 }}>
        <F label="FULL NAME" field="full_name" placeholder="Your full name"/>
        <F label="JOB TITLE" field="job_title" placeholder="e.g. Senior Civil Engineer"/>
        <F label="CURRENT EMPLOYER" field="current_employer" placeholder="Where you currently work"/>
        <F label="QUALIFICATION" field="qualification" placeholder="e.g. MEng Civil Engineering, UCL"/>
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:10, color:'var(--t3)', letterSpacing:'.5px', marginBottom:5 }}>BIO</div>
          <textarea value={form.bio} onChange={e => setForm({...form, bio:e.target.value})} placeholder="Short bio — what are you looking for next?" maxLength={200}
            style={{ width:'100%', background:'var(--bg3)', border:'0.5px solid var(--border)', borderRadius:10, padding:'11px 13px', color:'#fff', fontSize:13, fontFamily:'inherit', outline:'none', resize:'none', height:80 }}/>
        </div>
        <F label="SKILLS (comma separated)" field="skills" placeholder="e.g. AutoCAD, Civil 3D, BIM, Project Management"/>
        <F label="YOUR LOCATION" field="location_name" placeholder="e.g. London, UK"/>
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:10, color:'var(--t3)', letterSpacing:'.5px', marginBottom:5 }}>SEARCH RADIUS</div>
          <select value={form.search_radius} onChange={e => setForm({...form, search_radius:e.target.value})} style={{ width:'100%', background:'var(--bg3)', border:'0.5px solid var(--border)', borderRadius:10, padding:'11px 13px', color:'#fff', fontSize:13, fontFamily:'inherit', outline:'none', cursor:'pointer' }}>
            {['Within 10 miles of my location','Within 25 miles of my location','Within 50 miles of my location','Within 100 miles of my location','Anywhere in my country','Anywhere in the world'].map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:10, color:'var(--t3)', letterSpacing:'.5px', marginBottom:5 }}>MINIMUM SALARY</div>
          <select value={form.min_salary} onChange={e => setForm({...form, min_salary:e.target.value})} style={{ width:'100%', background:'var(--bg3)', border:'0.5px solid var(--border)', borderRadius:10, padding:'11px 13px', color:'#fff', fontSize:13, fontFamily:'inherit', outline:'none', cursor:'pointer' }}>
            {['£20k+','£30k+','£40k+','£50k+','£60k+','£70k+','£90k+','£120k+'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:10, color:'var(--t3)', letterSpacing:'.5px', marginBottom:5 }}>WORK STYLE</div>
          <select value={form.work_style} onChange={e => setForm({...form, work_style:e.target.value})} style={{ width:'100%', background:'var(--bg3)', border:'0.5px solid var(--border)', borderRadius:10, padding:'11px 13px', color:'#fff', fontSize:13, fontFamily:'inherit', outline:'none', cursor:'pointer' }}>
            {['Any','Hybrid','Remote only','On-site only'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <button className="btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : '✓ Save changes'}</button>
        <div style={{ height:20 }}/>
      </div>
    </>
  )
}
