import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

export default function PostJob() {
  const nav = useNavigate()
  const { user } = useAuth()
  const [form, setForm] = useState({ title:'', salary_min:'', salary_max:'', job_type:'Full-time', work_style:'Hybrid', location:'', availability:'Within 1 month', contract:'Permanent', seniority_level:'Senior', description:'', skills_required:'', perks:'' })
  const [loading, setLoading] = useState(false)

  async function submit() {
    if (!form.title || !form.location) return
    setLoading(true)
    const { data: company } = await supabase.from('companies').select('id').eq('owner_id', user.id).single()
    if (!company) { setLoading(false); return }
    await supabase.from('jobs').insert({ ...form, salary_min: parseInt(form.salary_min.replace(/[^0-9]/g,'')) || null, salary_max: parseInt(form.salary_max.replace(/[^0-9]/g,'')) || null, company_id: company.id, status: 'active' })
    setLoading(false)
    nav('/employer')
  }

  const F = ({ label, field, type='text', placeholder='', component='input' }) => (
    <div style={{ marginBottom:10 }}>
      <div style={{ fontSize:10, color:'var(--t3)', letterSpacing:'.5px', marginBottom:4 }}>{label}</div>
      {component==='textarea' ? (
        <textarea value={form[field]} onChange={e => setForm({...form, [field]:e.target.value})} placeholder={placeholder}
          style={{ width:'100%', background:'var(--bg3)', border:'0.5px solid var(--border)', borderRadius:9, padding:'10px 12px', color:'#fff', fontSize:12, fontFamily:'inherit', outline:'none', resize:'none', height:75 }}/>
      ) : (
        <input type={type} value={form[field]} onChange={e => setForm({...form, [field]:e.target.value})} placeholder={placeholder}
          style={{ width:'100%', background:'var(--bg3)', border:'0.5px solid var(--border)', borderRadius:9, padding:'10px 12px', color:'#fff', fontSize:12, fontFamily:'inherit', outline:'none' }}/>
      )}
    </div>
  )
  const S = ({ label, field, opts }) => (
    <div style={{ flex:1, marginBottom:10 }}>
      <div style={{ fontSize:10, color:'var(--t3)', letterSpacing:'.5px', marginBottom:4 }}>{label}</div>
      <select value={form[field]} onChange={e => setForm({...form, [field]:e.target.value})} style={{ width:'100%', background:'var(--bg3)', border:'0.5px solid var(--border)', borderRadius:9, padding:'10px 12px', color:'#fff', fontSize:12, fontFamily:'inherit', outline:'none', cursor:'pointer' }}>
        {opts.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  )

  return (
    <>
      <div className="status-bar" style={{ background:'var(--bg2)' }}><span>9:41</span><div className="status-icons"><i className="ti ti-wifi"/><i className="ti ti-battery-2"/></div></div>
      <div className="page-header">
        <button onClick={() => nav('/employer')} style={{ background:'none', border:'none', cursor:'pointer' }}><i className="ti ti-arrow-left" style={{ fontSize:18, color:'var(--t2)' }}/></button>
        <h1>Post a role</h1>
      </div>
      <div className="scroll" style={{ background:'var(--bg)', padding:12 }}>
        <F label="JOB TITLE *" field="title" placeholder="e.g. Senior Civil Engineer"/>
        <div style={{ display:'flex', gap:8 }}>
          <F label="MIN SALARY" field="salary_min" placeholder="£40,000"/>
          <F label="MAX SALARY" field="salary_max" placeholder="£55,000"/>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <S label="JOB TYPE" field="job_type" opts={['Full-time','Part-time','Contract','Freelance']}/>
          <S label="WORK STYLE" field="work_style" opts={['Hybrid','Remote','On-site']}/>
        </div>
        <F label="LOCATION *" field="location" placeholder="e.g. London, EC2 or Remote — Worldwide"/>
        <div style={{ background:'var(--sd)', border:'0.5px solid var(--sb)', borderRadius:9, padding:'9px 12px', marginBottom:10, display:'flex', gap:6, alignItems:'center' }}>
          <i className="ti ti-calendar" style={{ fontSize:13, color:'var(--spark)', flexShrink:0 }}/>
          <span style={{ fontSize:10, color:'#bbb' }}>Start date is one of the most searched filters by candidates.</span>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <S label="AVAILABILITY" field="availability" opts={['Immediate start','Within 1 month','Within 2 months','Within 3 months','Flexible — to be agreed']}/>
          <S label="CONTRACT" field="contract" opts={['Permanent','6 months','12 months','2 years','Project-based']}/>
        </div>
        <S label="SENIORITY LEVEL" field="seniority_level" opts={['Junior / Graduate','Mid-level','Senior','Lead / Manager','Director']}/>
        <F label="ROLE DESCRIPTION" field="description" placeholder="Describe the role, team and what success looks like..." component="textarea"/>
        <F label="SKILLS REQUIRED" field="skills_required" placeholder="e.g. AutoCAD, Civil 3D, BIM, Project Management"/>
        <F label="PERKS & BENEFITS (optional)" field="perks" placeholder="e.g. 25 days holiday, private healthcare, training budget..." component="textarea"/>
        <button className="btn-primary" style={{ marginTop:4 }} onClick={submit} disabled={loading || !form.title || !form.location}>
          {loading ? <i className="ti ti-loader spin"/> : <i className="ti ti-bolt"/>} Post role — go live instantly
        </button>
        <div style={{ height:16 }}/>
      </div>
    </>
  )
}
