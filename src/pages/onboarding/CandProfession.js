import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

const PROFESSIONS = ['Civil Engineer','Structural Engineer','Mechanical Engineer','Electrical Engineer','Software Engineer','Town Planner','Architect','Urban Designer','Solicitor','Barrister','Paralegal','Accountant','Financial Analyst','Investment Banker','Doctor','Nurse','Surgeon','Captain / Pilot','Air Traffic Controller','Product Manager','Data Scientist','UX Designer','DevOps Engineer','Quantity Surveyor','Site Manager','Project Manager','Teacher','Marketing Manager','HR Manager','Other']
const SENIORITY = ['Junior / Graduate (0–2 yrs)','Mid-level (3–6 yrs)','Senior (7–12 yrs)','Lead / Principal','Director / C-Suite']

export default function CandProfession() {
  const nav = useNavigate()
  const { user } = useAuth()
  const [form, setForm] = useState({ profession:'Civil Engineer', jobTitle:'', seniority:'Senior (7–12 yrs)', employer:'', qualification:'' })
  const [loading, setLoading] = useState(false)

  async function continueOn() {
    if (!form.jobTitle || form.jobTitle.trim().length < 2) {
      alert('Please enter your job title')
      return
    }
    setLoading(true)
    await supabase.from('profiles').upsert({ id: user.id, profession: form.profession, job_title: form.jobTitle, seniority: form.seniority, current_employer: form.employer, qualification: form.qualification })
    setLoading(false)
    nav('/onboarding/cv')
  }

  return (
    <>
      <div className="status-bar"><span>9:41</span><div className="status-icons"><i className="ti ti-wifi"/><i className="ti ti-battery-2"/></div></div>
      <div className="ob-wrap">
        <button className="back-btn" onClick={() => nav('/onboarding')}><i className="ti ti-arrow-left"/> Back</button>
        <div className="ob-progress"><div className="ob-step done"/><div className="ob-step done"/><div className="ob-step"/><div className="ob-step"/></div>
        <div className="ob-h">What do you do?</div>
        <div className="ob-sub">Your profession is the first thing employers see.</div>
        <div className="input-row"><i className="ti ti-briefcase"/>
          <select value={form.profession} onChange={e => setForm({...form, profession:e.target.value})}>
            {PROFESSIONS.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div className="input-row"><i className="ti ti-pencil"/><input placeholder="Your exact job title (e.g. Senior Civil Engineer)" value={form.jobTitle} onChange={e => setForm({...form, jobTitle:e.target.value})}/></div>
        <div className="input-row"><i className="ti ti-chart-bar"/>
          <select value={form.seniority} onChange={e => setForm({...form, seniority:e.target.value})}>
            {SENIORITY.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="input-row"><i className="ti ti-building"/><input placeholder="Current employer (optional)" value={form.employer} onChange={e => setForm({...form, employer:e.target.value})}/></div>
        <div className="input-row"><i className="ti ti-school"/><input placeholder="Highest qualification" value={form.qualification} onChange={e => setForm({...form, qualification:e.target.value})}/></div>
        <div style={{ marginTop:'auto' }}>
          <button className="btn-primary" onClick={continueOn} disabled={loading}>
            {loading ? <i className="ti ti-loader spin"/> : null} Continue <i className="ti ti-arrow-right"/>
          </button>
        </div>
      </div>
    </>
  )
}
