import { useNavigate } from 'react-router-dom'

export default function Splash() {
  const nav = useNavigate()
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'36px 26px', background:'var(--bg)' }}>
      <div style={{ width:76, height:76, background:'var(--spark)', borderRadius:22, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20 }}>
        <svg viewBox="0 0 32 32" fill="none" width={46} height={46}>
          <path d="M19 3L10 17H16L13 29L24 13H17.5L19 3Z" fill="white" opacity="0.95"/>
        </svg>
      </div>
      <div style={{ fontSize:40, fontWeight:500, color:'#fff', letterSpacing:-2, marginBottom:8 }}>
        flint<span style={{ color:'var(--spark)' }}>.</span>
      </div>
      <div style={{ fontSize:14, color:'var(--t2)', textAlign:'center', lineHeight:1.6, marginBottom:48 }}>
        Job matching where both sides say yes.<br />Swipe on roles. Get sparked back.
      </div>
      <button className="btn-primary" onClick={() => nav('/signup')} style={{ marginBottom:10 }}>
        <i className="ti ti-user-plus"></i> Create a free account
      </button>
      <div style={{ display:'flex', alignItems:'center', gap:10, margin:'4px 0', fontSize:12, color:'var(--t3)', width:'100%' }}>
        <div style={{ flex:1, height:'0.5px', background:'var(--border)' }}/>or<div style={{ flex:1, height:'0.5px', background:'var(--border)' }}/>
      </div>
      <button className="btn-secondary" onClick={() => nav('/login')} style={{ marginTop:4 }}>
        <i className="ti ti-login"></i> I already have an account
      </button>
      <p style={{ fontSize:11, color:'var(--t3)', textAlign:'center', marginTop:18, lineHeight:1.5 }}>
        By continuing you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  )
}
