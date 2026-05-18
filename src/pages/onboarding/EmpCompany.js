import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

export default function EmpCompany() {
  const nav = useNavigate()
  const { user } = useAuth()
  const [form, setForm] = useState({ name:'', website:'', location:'', size:'51–200', industry:'Engineering & Infrastructure' })
  const [loading, setLoading] = useState(false)

  async function continueOn() {
    if (!form.name || !form.location) return
    setLoading(true)
    await supabase.from('companies').upsert({ owner_id: user.id, name: form.name, website: form.website, location: form.location, size: form.size, industry: form.industry })
    setLoading(false)
    nav('/onboarding/verify')
  }

  return (
    <>
      <div className="status-bar"><span>9:41</span><div className="status-icons"><i className="ti ti-wifi"/><i className="ti ti-battery-2"/></div></div>
      <div className="ob-wrap">
        <button className="back-btn" onClick={() => nav('/onboarding')}><i className="ti ti-arrow-left"/> Back</button>
        <div className="ob-progress"><div className="ob-step done"/><div className="ob-step done"/><div className="ob-step"/></div>
        <div className="ob-h">Tell us about your company</div>
        <div className="ob-sub">This is what candidates see when you spark them.</div>
        <div className="input-row"><i className="ti ti-building"/><input placeholder="Company name *" value={form.name} onChange={e => setForm({...form, name:e.target.value})}/></div>
        <div className="input-row"><i className="ti ti-world"/><input placeholder="Company website" value={form.website} onChange={e => setForm({...form, website:e.target.value})}/></div>
        <div className="input-row"><i className="ti ti-map-pin"/><input placeholder="Company location *" value={form.location} onChange={e => setForm({...form, location:e.target.value})}/></div>
        <div className="input-row"><i className="ti ti-users"/>
          <select value={form.size} onChange={e => setForm({...form, size:e.target.value})}>
            {['1–10','11–50','51–200','201–500','500+'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="input-row"><i className="ti ti-category"/>
          <select value={form.industry} onChange={e => setForm({...form, industry:e.target.value})}>
            {['Engineering & Infrastructure','Technology','Finance','Healthcare','Construction','Legal','Retail','Other'].map(i => <option key={i}>{i}</option>)}
          </select>
        </div>
        <div style={{ marginTop:'auto' }}>
          <button className="btn-primary" onClick={continueOn} disabled={loading || !form.name || !form.location}>
            {loading ? <i className="ti ti-loader spin"/> : null} Continue <i className="ti ti-arrow-right"/>
          </button>
        </div>
      </div>
    </>
  )
}
