import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function EditJob() {
  const nav = useNavigate()
  const { jobId } = useParams()
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showDel, setShowDel] = useState(false)

  useEffect(() => {
    supabase.from('jobs').select('*').eq('id', jobId).single().then(({ data }) => { setForm(data); setLoading(false) })
  }, [jobId])

  async function save() {
    setSaving(true)
    await supabase.from('jobs').update(form).eq('id', jobId)
    setSaving(false)
    nav('/employer')
  }

  async function deleteJob() {
    await supabase.from('jobs').delete().eq('id', jobId)
    nav('/employer')
  }

  if (loading || !form) return <div className="loading-screen"><i className="ti ti-loader spin"/></div>

  const F = ({ label, field, type='text', placeholder='' }) => (
    <div style={{ marginBottom:10 }}>
      <div style={{ fontSize:10, color:'var(--t3)', letterSpacing:'.5px', marginBottom:4 }}>{label}</div>
      <input type={type} value={form[field]||''} onChange={e => setForm({...form, [field]:e.target.value})} placeholder={placeholder}
        style={{ width:'100%', background:'var(--bg3)', border:'0.5px solid var(--border)', borderRadius:9, padding:'10px 12px', color:'#fff', fontSize:12, fontFamily:'inherit', outline:'none' }}/>
    </div>
  )
  const S = ({ label, field, opts }) => (
    <div style={{ flex:1, marginBottom:10 }}>
      <div style={{ fontSize:10, color:'var(--t3)', letterSpacing:'.5px', marginBottom:4 }}>{label}</div>
      <select value={form[field]||''} onChange={e => setForm({...form, [field]:e.target.value})} style={{ width:'100%', background:'var(--bg3)', border:'0.5px solid var(--border)', borderRadius:9, padding:'10px 12px', color:'#fff', fontSize:12, fontFamily:'inherit', outline:'none', cursor:'pointer' }}>
        {opts.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  )

  return (
    <>
      <div className="status-bar" style={{ background:'var(--bg2)' }}><span>9:41</span><div className="status-icons"><i className="ti ti-wifi"/><i className="ti ti-battery-2"/></div></div>
      <div className="page-header">
        <button onClick={() => nav('/employer')} style={{ background:'none', border:'none', cursor:'pointer' }}><i className="ti ti-arrow-left" style={{ fontSize:18, color:'var(--t2)' }}/></button>
        <h1>Edit role</h1>
        <button onClick={save} style={{ background:'none', border:'none', cursor:'pointer', fontSize:13, color:'var(--spark)', fontFamily:'inherit', fontWeight:500 }}>{saving ? '...' : 'Save'}</button>
      </div>
      <div className="scroll" style={{ background:'var(--bg)', padding:12 }}>
        <div style={{ background:'var(--gd)', border:'0.5px solid var(--gb)', borderRadius:9, padding:'9px 12px', display:'flex', alignItems:'center', gap:6, marginBottom:11 }}>
          <i className="ti ti-info-circle" style={{ fontSize:12, color:'var(--green)' }}/>
          <span style={{ fontSize:11, color:'#aaa' }}>Changes go live immediately.</span>
        </div>
        <F label="JOB TITLE" field="title"/>
        <div style={{ display:'flex', gap:8 }}>
          <F label="MIN SALARY" field="salary_min"/>
          <F label="MAX SALARY" field="salary_max"/>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <S label="JOB TYPE" field="job_type" opts={['Full-time','Part-time','Contract','Freelance']}/>
          <S label="WORK STYLE" field="work_style" opts={['Hybrid','Remote','On-site']}/>
        </div>
        <F label="LOCATION" field="location"/>
        <div style={{ display:'flex', gap:8 }}>
          <S label="AVAILABILITY" field="availability" opts={['Immediate start','Within 1 month','Within 2 months','Within 3 months','Flexible']}/>
          <S label="CONTRACT" field="contract" opts={['Permanent','6 months','12 months','Project-based']}/>
        </div>
        <div style={{ marginBottom:10 }}>
          <div style={{ fontSize:10, color:'var(--t3)', letterSpacing:'.5px', marginBottom:4 }}>ROLE DESCRIPTION</div>
          <textarea value={form.description||''} onChange={e => setForm({...form, description:e.target.value})} style={{ width:'100%', background:'var(--bg3)', border:'0.5px solid var(--border)', borderRadius:9, padding:'10px 12px', color:'#fff', fontSize:12, fontFamily:'inherit', outline:'none', resize:'none', height:75 }}/>
        </div>
        <F label="SKILLS REQUIRED" field="skills_required"/>
        <S label="STATUS" field="status" opts={['active','paused']}/>
        <div style={{ display:'flex', gap:6, marginTop:4 }}>
          <button className="btn-primary" style={{ flex:1, marginBottom:0 }} onClick={save}><i className="ti ti-circle-check"/>Save changes</button>
          <button className="btn-sm danger" style={{ padding:'14px 15px' }} onClick={() => setShowDel(true)}><i className="ti ti-trash"/></button>
        </div>
        <div style={{ height:16 }}/>
      </div>
      {showDel && (
        <div className="modal-overlay" onClick={() => setShowDel(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Delete this role?</div>
            <div className="modal-sub">Cannot be undone. All applicants will no longer see this listing.</div>
            <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
              <button className="btn-primary" style={{ background:'var(--red)', color:'#fff', marginBottom:0 }} onClick={deleteJob}><i className="ti ti-trash"/> Yes, delete</button>
              <button className="btn-secondary" onClick={() => setShowDel(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
