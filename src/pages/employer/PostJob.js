import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

const inputStyle = { width:'100%', background:'var(--bg3)', border:'0.5px solid var(--border)', borderRadius:9, padding:'10px 12px', color:'#fff', fontSize:12, fontFamily:'inherit', outline:'none' }
const selectStyle = { ...inputStyle, cursor:'pointer' }
const labelStyle = { fontSize:10, color:'var(--t3)', letterSpacing:'.5px', marginBottom:4, display:'block' }

export default function PostJob() {
  const nav = useNavigate()
  const { user, profile } = useAuth()
  const [title, setTitle] = useState('')
  const [salaryMin, setSalaryMin] = useState('')
  const [salaryMax, setSalaryMax] = useState('')
  const [jobType, setJobType] = useState('Full-time')
  const [workStyle, setWorkStyle] = useState('Hybrid')
  const [location, setLocation] = useState('')
  const [availability, setAvailability] = useState('Within 1 month')
  const [contract, setContract] = useState('Permanent')
  const [seniority, setSeniority] = useState('Senior')
  const [description, setDescription] = useState('')
  const [skills, setSkills] = useState('')
  const [perks, setPerks] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  function validate() {
    const e = {}
    if (!title.trim() || title.trim().length < 3) e.title = 'Enter a proper job title (at least 3 characters)'
    if (!location.trim() || location.trim().length < 2) e.location = 'Enter a location'
    if (salaryMin && salaryMax && parseInt(salaryMin) > parseInt(salaryMax)) e.salary = 'Min salary cannot be higher than max'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function submit() {
    if (!validate()) return
    setLoading(true)

    // Get company_id from profile first, then fall back to querying companies table
    let companyId = profile?.company_id

    if (!companyId) {
      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', user.id)
        .maybeSingle()
      companyId = company?.id
    }

    // If still no company, create one automatically
    if (!companyId) {
      const { data: newCompany } = await supabase
        .from('companies')
        .insert({ owner_id: user.id, name: 'My Company', location: 'Not set', size: '1–10', industry: 'Other' })
        .select('id')
        .single()
      companyId = newCompany?.id
    }

    if (!companyId) {
      setErrors({ title: 'Something went wrong. Please try again.' })
      setLoading(false)
      return
    }

    // Geocode the job location so distance filtering works
    let jobLat = null, jobLon = null
    if (location.trim() && workStyle !== 'Remote') {
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location.trim())}&format=json&limit=1`)
        const d = await r.json()
        if (d[0]) { jobLat = parseFloat(d[0].lat); jobLon = parseFloat(d[0].lon) }
      } catch {}
    }

    const { error } = await supabase.from('jobs').insert({
      title: title.trim(),
      salary_min: parseInt(salaryMin.replace(/[^0-9]/g,'')) || null,
      salary_max: parseInt(salaryMax.replace(/[^0-9]/g,'')) || null,
      job_type: jobType,
      work_style: workStyle,
      location: location.trim(),
      lat: jobLat,
      lon: jobLon,
      availability,
      contract,
      seniority_level: seniority,
      description: description.trim(),
      skills_required: skills.trim(),
      perks: perks.trim(),
      company_id: companyId,
      status: 'active'
    })

    setLoading(false)
    if (error) {
      console.error('Job insert error:', error)
      setErrors({ title: 'Could not post job. Please try again.' })
      return
    }
    nav('/employer')
  }

  return (
    <>
      <div className="status-bar" style={{ background:'var(--bg2)' }}><span>9:41</span><div className="status-icons"><i className="ti ti-wifi"/><i className="ti ti-battery-2"/></div></div>
      <div className="page-header">
        <button onClick={() => nav('/employer')} style={{ background:'none', border:'none', cursor:'pointer' }}><i className="ti ti-arrow-left" style={{ fontSize:18, color:'var(--t2)' }}/></button>
        <h1>Post a role</h1>
      </div>
      <div className="scroll" style={{ background:'var(--bg)', padding:12 }}>

        <div style={{ marginBottom:10 }}>
          <label style={labelStyle}>JOB TITLE *</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Senior Civil Engineer" style={{ ...inputStyle, borderColor: errors.title ? 'var(--red)' : '' }}/>
          {errors.title && <p style={{ fontSize:11, color:'var(--red)', marginTop:4 }}>{errors.title}</p>}
        </div>

        <div style={{ display:'flex', gap:8 }}>
          <div style={{ flex:1, marginBottom:10 }}>
            <label style={labelStyle}>MIN SALARY (£)</label>
            <input value={salaryMin} onChange={e => setSalaryMin(e.target.value)} placeholder="e.g. 40000" style={inputStyle}/>
          </div>
          <div style={{ flex:1, marginBottom:10 }}>
            <label style={labelStyle}>MAX SALARY (£)</label>
            <input value={salaryMax} onChange={e => setSalaryMax(e.target.value)} placeholder="e.g. 55000" style={inputStyle}/>
          </div>
        </div>
        {errors.salary && <p style={{ fontSize:11, color:'var(--red)', marginTop:-6, marginBottom:8 }}>{errors.salary}</p>}

        <div style={{ display:'flex', gap:8 }}>
          <div style={{ flex:1, marginBottom:10 }}>
            <label style={labelStyle}>JOB TYPE</label>
            <select value={jobType} onChange={e => setJobType(e.target.value)} style={selectStyle}>
              {['Full-time','Part-time','Contract','Freelance'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div style={{ flex:1, marginBottom:10 }}>
            <label style={labelStyle}>WORK STYLE</label>
            <select value={workStyle} onChange={e => setWorkStyle(e.target.value)} style={selectStyle}>
              {['Hybrid','Remote','On-site'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginBottom:10 }}>
          <label style={labelStyle}>LOCATION *</label>
          <input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. London, EC2 or Remote — Worldwide" style={{ ...inputStyle, borderColor: errors.location ? 'var(--red)' : '' }}/>
          {errors.location && <p style={{ fontSize:11, color:'var(--red)', marginTop:4 }}>{errors.location}</p>}
        </div>

        <div style={{ background:'var(--sd)', border:'0.5px solid var(--sb)', borderRadius:9, padding:'9px 12px', marginBottom:10, display:'flex', gap:6, alignItems:'center' }}>
          <i className="ti ti-calendar" style={{ fontSize:13, color:'var(--spark)', flexShrink:0 }}/>
          <span style={{ fontSize:10, color:'#bbb' }}>Start date is one of the most searched filters by candidates.</span>
        </div>

        <div style={{ display:'flex', gap:8 }}>
          <div style={{ flex:1, marginBottom:10 }}>
            <label style={labelStyle}>AVAILABILITY</label>
            <select value={availability} onChange={e => setAvailability(e.target.value)} style={selectStyle}>
              {['Immediate start','Within 1 month','Within 2 months','Within 3 months','Flexible'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div style={{ flex:1, marginBottom:10 }}>
            <label style={labelStyle}>CONTRACT</label>
            <select value={contract} onChange={e => setContract(e.target.value)} style={selectStyle}>
              {['Permanent','6 months','12 months','2 years','Project-based'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginBottom:10 }}>
          <label style={labelStyle}>SENIORITY LEVEL</label>
          <select value={seniority} onChange={e => setSeniority(e.target.value)} style={selectStyle}>
            {['Junior / Graduate','Mid-level','Senior','Lead / Manager','Director'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>

        <div style={{ marginBottom:10 }}>
          <label style={labelStyle}>ROLE DESCRIPTION</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the role, team and what success looks like..." style={{ ...inputStyle, resize:'none', height:90 }}/>
        </div>

        <div style={{ marginBottom:10 }}>
          <label style={labelStyle}>SKILLS REQUIRED</label>
          <input value={skills} onChange={e => setSkills(e.target.value)} placeholder="e.g. AutoCAD, Civil 3D, BIM, Project Management" style={inputStyle}/>
        </div>

        <div style={{ marginBottom:10 }}>
          <label style={labelStyle}>PERKS & BENEFITS (optional)</label>
          <textarea value={perks} onChange={e => setPerks(e.target.value)} placeholder="e.g. 25 days holiday, private healthcare, training budget..." style={{ ...inputStyle, resize:'none', height:75 }}/>
        </div>

        <button className="btn-primary" style={{ marginTop:4 }} onClick={submit} disabled={loading}>
          {loading ? <i className="ti ti-loader spin"/> : <i className="ti ti-bolt"/>} {loading ? 'Posting...' : 'Post role — go live instantly'}
        </button>
        <div style={{ height:16 }}/>
      </div>
    </>
  )
}
