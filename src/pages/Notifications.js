import { useNavigate } from 'react-router-dom'

export default function Notifications() {
  const nav = useNavigate()

  const items = [
    { icon:'AC', bg:'#4F46E5', title:'Acme Engineering sparked you — mutual match!', time:'2 minutes ago', unread:true, path:'/sparks' },
    { icon:'NX', bg:'#7C3AED', title:'Nexus Civil is reviewing your application', time:'1 hour ago', unread:true, path:'/applications' },
    { isCrown:true, bg:'linear-gradient(135deg,#F5A623,#E8832A)', title:'14 employers viewed your profile — see who', time:'Today', unread:false, path:'/premium' },
    { isBolt:true, bg:'var(--bg3)', title:'8 new roles matching your preferences today', time:'This morning', unread:false, path:'/discover' },
    { icon:'WS', bg:'#059669', title:'Whitestone Group updated the role you applied to', time:'Yesterday', unread:false, path:'/applications' },
  ]

  return (
    <>
      <div className="status-bar" style={{ background:'var(--bg2)' }}><span>9:41</span><div className="status-icons"><i className="ti ti-wifi"/><i className="ti ti-battery-2"/></div></div>
      <div className="page-header">
        <button onClick={() => nav(-1)} style={{ background:'none', border:'none', cursor:'pointer' }}><i className="ti ti-arrow-left" style={{ fontSize:18, color:'var(--t2)' }}/></button>
        <h1>Notifications</h1>
        <button style={{ background:'none', border:'none', cursor:'pointer', fontSize:12, color:'var(--spark)', fontFamily:'inherit' }}>Mark all read</button>
      </div>
      <div className="scroll" style={{ background:'var(--bg)' }}>
        {items.map((item, i) => (
          <div key={i} className={`notif-item ${item.unread ? 'unread' : ''}`} onClick={() => nav(item.path)}>
            <div className="notif-av" style={{ background:item.bg, borderRadius:8 }}>
              {item.isCrown
                ? <i className="ti ti-crown" style={{ fontSize:17, color:'#000' }}/>
                : item.isBolt
                ? <i className="ti ti-flame" style={{ fontSize:17, color:'var(--spark)' }}/>
                : <span style={{ fontSize:13, fontWeight:500 }}>{item.icon}</span>
              }
            </div>
            <div className="notif-content">
              <div className="notif-title">{item.title}</div>
              <div className="notif-time">{item.time}</div>
            </div>
            {item.unread && <div className="unread-dot"/>}
          </div>
        ))}
      </div>
    </>
  )
}
