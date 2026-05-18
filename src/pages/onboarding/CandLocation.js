import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

const RADII = ['Within 10 miles of my location','Within 25 miles of my location','Within 50 miles of my location','Within 100 miles of my location','Anywhere in my country','Anywhere in the world']

export default function CandLocation() {
  const nav = useNavigate()
  const { user } = useAuth()
  const [locState, setLocState] = useState('detecting') // detecting | found | error
  const [cityName, setCityName] = useState('')
  const [lat, setLat] = useState(null)
  const [lon, setLon] = useState(null)
  const [manualLoc, setManualLoc] = useState('')
  const [radius, setRadius] = useState('Within 25 miles of my location')
  const [salary, setSalary] = useState('£50k+')
  const [workStyle, setWorkStyle] = useState('Hybrid')
  const [loading, setLoading] = useState(false)

  useEffect(() => { detectLocation() }, [])

  function detectLocation() {
    setLocState('detecting')
    if (!navigator.geolocation) { setLocState('error'); return }
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { latitude, longitude } = pos.coords
        setLat(latitude); setLon(longitude)
        try {
          const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
          const d = await r.json()
          const a = d.address
          const city = a.city || a.town || a.village || a.county || 'Your location'
          const country = (a.country_code || '').toUpperCase()
          setCityName(`${city}${country ? ', '+country : ''}`)
          setLocState('found')
        } catch { setCityName('Location detected'); setLocState('found') }
      },
      () => setLocState('error')
    )
  }

  async function continueOn() {
    setLoading(true)
    const locData = { id: user.id, location_name: cityName || manualLoc, search_radius: radius, min_salary: salary, work_style: workStyle, onboarded: true, active_role: 'candidate', role: 'candidate' }
    if (lat) { locData.lat = lat; locData.lon = lon }
    await supabase.from('profiles').upsert(locData)
    setLoading(false)
    nav('/discover')
  }

  return (
    <>
      <div className="status-bar"><span>9:41</span><div className="status-icons"><i className="ti ti-wifi"/><i className="ti ti-battery-2"/></div></div>
      <div className="ob-wrap">
        <button className="back-btn" onClick={() => nav('/onboarding/cv')}><i className="ti ti-arrow-left"/> Back</button>
        <div className="ob-progress"><div className="ob-step done"/><div className="ob-step done"/><div className="ob-step done"/><div className="ob-step done"/></div>
        <div className="ob-h">Where are you based?</div>
        <div className="ob-sub">We use your real location to find roles within your preferred distance. We never share your exact coordinates.</div>

        <div style={{ background:'var(--bg2)', border:'0.5px solid var(--border)', borderRadius:13, padding:14, marginBottom:14 }}>
          {locState === 'detecting' && (
            <div style={{ display:'flex', alignItems:'center', gap:10, fontSize:13, color:'var(--t2)' }}>
              <i className="ti ti-loader spin" style={{ fontSize:18, color:'var(--spark)' }}/>
              <span>Detecting your location...</span>
            </div>
          )}
          {locState === 'found' && (
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:38, height:38, background:'var(--gd)', border:'0.5px solid var(--gb)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <i className="ti ti-map-pin-check" style={{ fontSize:18, color:'var(--green)' }}/>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:500, color:'#fff' }}>{cityName}</div>
                <div style={{ fontSize:10, color:'var(--t3)' }}>Location detected successfully</div>
              </div>
              <button onClick={detectLocation} style={{ background:'none', border:'none', cursor:'pointer', fontSize:11, color:'var(--spark)', fontFamily:'inherit' }}>Change</button>
            </div>
          )}
          {locState === 'error' && (
            <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
              <i className="ti ti-alert-triangle" style={{ fontSize:15, color:'var(--spark)', flexShrink:0, marginTop:1 }}/>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:12, color:'#bbb', lineHeight:1.5, marginBottom:8 }}>Location denied. Enter manually:</p>
                <input type="text" placeholder="e.g. London, UK" value={manualLoc} onChange={e => { setManualLoc(e.target.value); setCityName(e.target.value) }}
                  style={{ width:'100%', background:'var(--bg3)', border:'0.5px solid var(--border)', borderRadius:8, padding:'9px 11px', color:'#fff', fontSize:12, fontFamily:'inherit', outline:'none' }}/>
              </div>
            </div>
          )}
        </div>

        <div className="sec-label">SEARCH RADIUS</div>
        <div className="input-row" style={{ marginBottom:12 }}>
          <i className="ti ti-radar"/>
          <select value={radius} onChange={e => setRadius(e.target.value)}>
            {RADII.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div className="sec-label">JOB PREFERENCES</div>
        <div className="input-row">
          <i className="ti ti-currency-pound"/>
          <select value={salary} onChange={e => setSalary(e.target.value)}>
            {['£20k+','£30k+','£40k+','£50k+','£60k+','£70k+','£90k+','£120k+'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="input-row">
          <i className="ti ti-home"/>
          <select value={workStyle} onChange={e => setWorkStyle(e.target.value)}>
            {['Any','Hybrid','Remote only','On-site only'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div style={{ marginTop:'auto' }}>
          <button className="btn-primary" onClick={continueOn} disabled={loading || (locState !== 'found' && !manualLoc)}>
            {loading ? <i className="ti ti-loader spin"/> : null} Start finding roles <i className="ti ti-flame"/>
          </button>
        </div>
      </div>
    </>
  )
}
