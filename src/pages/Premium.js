import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Premium() {
  const nav = useNavigate()
  const [plan, setPlan] = useState('annual')

  const features = [
    ['ti-eye', 'See who viewed your profile', '14 employers viewed you this week.'],
    ['ti-bolt', 'Priority in employer shortlists', 'Appear first for every role you apply to.'],
    ['ti-rotate-clockwise', 'Unlimited rewinds', 'Accidentally passed? Undo instantly.'],
    ['ti-world', 'Global role search', 'Search roles anywhere in the world.'],
    ['ti-message-circle', 'Read receipts in chat', 'Know when employers read your messages.'],
    ['ti-chart-bar', 'Profile analytics', 'See your fit scores and view trends.'],
  ]

  return (
    <>
      <div className="status-bar" style={{ background:'#0a0500' }}><span>9:41</span><div className="status-icons"><i className="ti ti-wifi"/><i className="ti ti-battery-2"/></div></div>
      <div style={{ background:'#0a0500', padding:'9px 15px', display:'flex', alignItems:'center', gap:9, borderBottom:'0.5px solid #2a1a00', flexShrink:0 }}>
        <button onClick={() => nav(-1)} style={{ background:'none', border:'none', cursor:'pointer' }}><i className="ti ti-x" style={{ fontSize:18, color:'var(--t2)' }}/></button>
        <div style={{ fontSize:15, fontWeight:500, color:'#fff', flex:1 }}>Flint Pro</div>
      </div>
      <div className="scroll" style={{ background:'var(--bg)' }}>
        <div style={{ background:'linear-gradient(160deg,#1a0a00,#0a0a0a)', padding:'24px 20px 20px', display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', borderBottom:'0.5px solid var(--border)' }}>
          <div style={{ width:60, height:60, background:'linear-gradient(135deg,var(--spark),var(--ember))', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12 }}>
            <i className="ti ti-crown" style={{ fontSize:28, color:'#000' }}/>
          </div>
          <div style={{ fontSize:24, fontWeight:500, color:'#fff', marginBottom:5 }}>Upgrade to Flint Pro</div>
          <div style={{ fontSize:13, color:'var(--t2)', lineHeight:1.6, maxWidth:280 }}>Land your next role faster. See who's watching.</div>
          <div style={{ display:'flex', background:'var(--bg3)', border:'0.5px solid var(--border)', borderRadius:9, padding:3, gap:3, marginTop:14, width:'100%' }}>
            <button onClick={() => setPlan('monthly')} style={{ flex:1, padding:'7px 0', borderRadius:7, border:'none', fontSize:11, fontWeight:500, fontFamily:'inherit', cursor:'pointer', background: plan==='monthly' ? 'var(--spark)' : 'transparent', color: plan==='monthly' ? '#000' : 'var(--t2)' }}>Monthly</button>
            <button onClick={() => setPlan('annual')} style={{ flex:1, padding:'7px 0', borderRadius:7, border:'none', fontSize:11, fontWeight:500, fontFamily:'inherit', cursor:'pointer', background: plan==='annual' ? 'var(--spark)' : 'transparent', color: plan==='annual' ? '#000' : 'var(--t2)', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
              Annual <span style={{ background:'var(--green)', color:'#fff', fontSize:8, fontWeight:700, borderRadius:3, padding:'1px 4px' }}>SAVE 50%</span>
            </button>
          </div>
        </div>
        <div style={{ margin:'14px 20px 0', background:'var(--bg2)', border:'0.5px solid var(--border)', borderRadius:12, padding:14 }}>
          <div style={{ display:'flex', alignItems:'baseline', gap:3 }}>
            <div style={{ fontSize:30, fontWeight:500, color:'#fff', letterSpacing:-1 }}>{plan==='annual' ? '£4.99' : '£9.99'}</div>
            <div style={{ fontSize:12, color:'var(--t2)' }}>/month{plan==='annual' ? ' · billed £59.99/year' : ' · cancel any time'}</div>
          </div>
          {plan==='annual' && <div style={{ fontSize:12, color:'var(--t3)', textDecoration:'line-through', marginTop:3 }}>Usually £9.99/month</div>}
        </div>
        <div style={{ padding:'14px 20px' }}>
          <div className="sec-label">WHAT YOU GET</div>
          {features.map(([icon, title, desc]) => (
            <div key={title} style={{ display:'flex', alignItems:'flex-start', gap:9, padding:'9px 0', borderBottom:'0.5px solid var(--border)' }}>
              <div style={{ width:30, height:30, borderRadius:8, background:'var(--sd)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <i className={`ti ${icon}`} style={{ fontSize:14, color:'var(--spark)' }}/>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12, fontWeight:500, color:'#fff', marginBottom:2 }}>{title}</div>
                <div style={{ fontSize:10, color:'var(--t2)', lineHeight:1.5 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding:'0 16px 24px' }}>
          <button className="btn-primary" style={{ background:'linear-gradient(135deg,var(--spark),var(--ember))', fontWeight:700 }} onClick={() => nav(-1)}>
            <i className="ti ti-crown"/> Start Pro — {plan==='annual' ? '£4.99' : '£9.99'}/mo
          </button>
          <div style={{ fontSize:10, color:'var(--t3)', textAlign:'center', marginTop:7 }}>Cancel any time · Apple Pay & Google Pay accepted</div>
        </div>
      </div>
    </>
  )
}
