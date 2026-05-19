import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

const COUNTRIES = ['United Kingdom','United States','Canada','Australia','Ireland','Germany','France','Netherlands','UAE','Singapore','Other']

const CITIES = {
  'United Kingdom': ['London','Manchester','Birmingham','Leeds','Edinburgh','Glasgow','Bristol','Liverpool','Sheffield','Newcastle','Cardiff','Belfast','Oxford','Cambridge','Other'],
  'United States': ['New York','Los Angeles','Chicago','Houston','Phoenix','Philadelphia','San Antonio','San Diego','Dallas','San Francisco','Other'],
  'Canada': ['Toronto','Vancouver','Montreal','Calgary','Ottawa','Edmonton','Other'],
  'Australia': ['Sydney','Melbourne','Brisbane','Perth','Adelaide','Other'],
  'Ireland': ['Dublin','Cork','Galway','Limerick','Other'],
  'Germany': ['Berlin','Munich','Hamburg','Frankfurt','Cologne','Other'],
  'France': ['Paris','Lyon','Marseille','Toulouse','Other'],
  'Netherlands': ['Amsterdam','Rotterdam','The Hague','Utrecht','Other'],
  'UAE': ['Dubai','Abu Dhabi','Sharjah','Other'],
  'Singapore': ['Singapore'],
  'Other': ['Other']
}

const RADII = ['Within 10 miles','Within 25 miles','Within 50 miles','Within 100 miles','Anywhere in my country','Anywhere in the world']

export default function CandLocation() {
  const nav = useNavigate()
  const { user, profile } = useAuth()
  const [country, setCountry] = useState('United Kingdom')
  const [city, setCity] = useState('London')
  const [radius, setRadius] = useState('Within 25 miles')
  const [salary, setSalary] = useState('£50k+')
  const [workStyle, setWorkStyle] = useState('Hybrid')
  const [loading, setLoading] = useState(false)

  function goBack() {
    if (profile?.onboarded) nav('/settings')
    else nav('/onboarding/cv')
  }

  function handleCountryChange(c) {
    setCountry(c)
    setCity(CITIES[c]?.[0] || 'Other')
  }

  async function continueOn() {
    setLoading(true)
    const locationName = city === 'Other' ? country : `${city}, ${country}`
    const locData = {
      id: user.id,
      location_name: locationName,
      search_radius: radius,
      min_salary: salary,
      work_style: workStyle,
      onboarded: true,
      active_role: 'candidate',
      role: 'candidate',
      has_candidate_profile: true,
      full_name: user.user_metadata?.full_name || profile?.full_name || '',
      email: user.email,
    }
    await supabase.from('profiles').upsert(locData, { onConflict: 'id' })
    setLoading(false)
    window.location.replace('/discover')
  }

  return (
    <>
      <div className="status-bar"><span>9:41</span><div className="status-icons"><i className="ti ti-wifi"/><i className="ti ti-battery-2"/></div></div>
      <div className="ob-wrap">
        <button className="back-btn" onClick={goBack}><i className="ti ti-arrow-left"/> Back</button>
        <div className="ob-progress"><div className="ob-step done"/><div className="ob-step done"/><div className="ob-step done"/><div className="ob-step done"/></div>
        <div className="ob-h">Where are you based?</div>
        <div className="ob-sub">We use your location to find roles nearby. We never share your exact address.</div>

        <div className="sec-label">COUNTRY</div>
        <div className="input-row" style={{ marginBottom:10 }}>
          <i className="ti ti-world"/>
          <select value={country} onChange={e => handleCountryChange(e.target.value)}>
            {COUNTRIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div className="sec-label">CITY</div>
        <div className="input-row" style={{ marginBottom:10 }}>
          <i className="ti ti-building-skyscraper"/>
          <select value={city} onChange={e => setCity(e.target.value)}>
            {(CITIES[country] || ['Other']).map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div className="sec-label">SEARCH RADIUS</div>
        <div className="input-row" style={{ marginBottom:14 }}>
          <i className="ti ti-radar"/>
          <select value={radius} onChange={e => setRadius(e.target.value)}>
            {RADII.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>

        <div className="sec-label">JOB PREFERENCES</div>
        <div className="input-row">
          <i className="ti ti-currency-pound"/>
          <select value={salary} onChange={e => setSalary(e.target.value)}>
            {['£20k+','£30k+','£40k+','£50k+','£60k+','£70k+','£90k+','£120k+','$50k+','$75k+','$100k+','$150k+'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="input-row">
          <i className="ti ti-home"/>
          <select value={workStyle} onChange={e => setWorkStyle(e.target.value)}>
            {['Any','Hybrid','Remote only','On-site only'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div style={{ marginTop:'auto' }}>
          <button className="btn-primary" onClick={continueOn} disabled={loading}>
            {loading ? <i className="ti ti-loader spin"/> : <i className="ti ti-flame"/>} {loading ? 'Setting up...' : 'Start finding roles'}
          </button>
        </div>
      </div>
    </>
  )
}
