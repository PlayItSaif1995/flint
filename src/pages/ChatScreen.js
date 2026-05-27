import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export default function ChatScreen() {
  const nav = useNavigate()
  const { matchId } = useParams()
  const { user, profile } = useAuth()
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [matchInfo, setMatchInfo] = useState(null)
  const [otherParty, setOtherParty] = useState(null)
  const [sending, setSending] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef(null)

  const isCandidate = (sessionStorage.getItem('chatFromRole') || profile?.active_role) === 'candidate'
  const backPath = isCandidate ? '/sparks' : '/employer/sparks'

  useEffect(() => {
    loadMatch()
    loadMessages()
    markRead()

    const channel = supabase.channel(`chat:${matchId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `match_id=eq.${matchId}`
      }, payload => {
        setMessages(prev => [...prev, payload.new])
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [matchId])

  async function loadMatch() {
    const { data: match } = await supabase
      .from('matches')
      .select('*, jobs(title, companies(name, location, industry))')
      .eq('id', matchId)
      .single()
    
    setMatchInfo(match)

    if (match) {
      if (isCandidate) {
        // Candidate sees company info
        setOtherParty({
          name: match.jobs?.companies?.name || 'Company',
          subtitle: match.jobs?.title || 'Mutual spark',
          location: match.jobs?.companies?.location || '',
          initials: (match.jobs?.companies?.name || 'CO').substring(0, 2).toUpperCase(),
          color: '#4F46E5'
        })
      } else {
        // Employer sees candidate info
        const { data: candProfile } = await supabase
          .from('profiles')
          .select('full_name, job_title, profession, location_name')
          .eq('id', match.candidate_id)
          .maybeSingle()
        setOtherParty({
          name: candProfile?.full_name || 'Candidate',
          subtitle: candProfile?.job_title || candProfile?.profession || match.jobs?.title || 'Applicant',
          location: candProfile?.location_name || '',
          initials: (candProfile?.full_name || 'CA').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
          color: '#E8832A'
        })
      }
    }
    setLoading(false)
  }

  async function loadMessages() {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('match_id', matchId)
      .order('created_at', { ascending: true })
    setMessages(data || [])
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  async function markRead() {
    const field = isCandidate ? 'candidate_read' : 'employer_read'
    await supabase.from('matches').update({ [field]: true }).eq('id', matchId)
  }

  async function sendMessage() {
    if (!text.trim() || sending) return
    setSending(true)
    const content = text.trim()
    setText('')
    const { error } = await supabase.from('messages').insert({
      match_id: matchId,
      sender_id: user.id,
      content,
      sender_role: profile?.active_role
    })
    if (!error) {
      const otherField = isCandidate ? 'employer_read' : 'candidate_read'
      await supabase.from('matches').update({
        last_message: content,
        last_message_at: new Date().toISOString(),
        [otherField]: false
      }).eq('id', matchId)
    }
    setSending(false)
  }

  async function unmatch() {
    await supabase.from('matches').update({ status: 'unmatched' }).eq('id', matchId)
    nav(backPath)
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  if (loading) return (
    <div className="app-shell" style={{ alignItems:'center', justifyContent:'center' }}>
      <i className="ti ti-loader spin" style={{ fontSize:24, color:'var(--spark)' }}/>
    </div>
  )

  return (
    <>
      <div className="status-bar" style={{ background:'var(--bg2)' }}><span>9:41</span><div className="status-icons"><i className="ti ti-wifi"/><i className="ti ti-battery-2"/></div></div>
      
      {/* Header */}
      <div className="chat-header">
        <button onClick={() => nav(backPath)} style={{ background:'none', border:'none', cursor:'pointer', padding:'4px 8px 4px 0' }}>
          <i className="ti ti-arrow-left" style={{ fontSize:18, color:'var(--t2)' }}/>
        </button>
        <div style={{ width:36, height:36, borderRadius:9, background: otherParty?.color || '#4F46E5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:500, color:'#fff', flexShrink:0 }}>
          {otherParty?.initials || '??'}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, fontWeight:500, color:'#fff' }}>{otherParty?.name || 'Loading...'}</div>
          <div style={{ fontSize:10, color:'var(--spark)' }}>
            {otherParty?.subtitle}
            {otherParty?.location ? ` · ${otherParty.location}` : ''}
            {matchInfo?.headhunt ? ' · Headhunt' : ' · Mutual spark'}
          </div>
        </div>
        <button onClick={() => setShowMenu(!showMenu)} style={{ background:'none', border:'none', cursor:'pointer', padding:'4px' }}>
          <i className="ti ti-dots-vertical" style={{ fontSize:17, color:'var(--t2)' }}/>
        </button>
      </div>

      {/* Dots menu */}
      {showMenu && (
        <div style={{ position:'absolute', top:90, right:14, background:'var(--bg2)', border:'0.5px solid var(--border)', borderRadius:11, zIndex:100, overflow:'hidden', minWidth:160 }} onClick={() => setShowMenu(false)}>
          <div onClick={unmatch} style={{ padding:'12px 14px', fontSize:13, color:'var(--red)', cursor:'pointer', display:'flex', alignItems:'center', gap:8, borderBottom:'0.5px solid var(--border)' }}>
            <i className="ti ti-bolt-off" style={{ fontSize:15 }}/> Unmatch
          </div>
          <div style={{ padding:'12px 14px', fontSize:13, color:'var(--t2)', cursor:'pointer', display:'flex', alignItems:'center', gap:8 }}>
            <i className="ti ti-flag" style={{ fontSize:15 }}/> Report
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="system-msg">
            <i className="ti ti-flame" style={{ fontSize:11, color:'var(--spark)' }}/>
            {isCandidate
              ? `You and ${otherParty?.name || 'this company'} matched — say hello!`
              : `You sparked ${otherParty?.name || 'this candidate'} — say hello!`
            }
          </div>
        )}
        {messages.map((msg, i) => {
          const isMine = msg.sender_id === user.id
          return (
            <div key={msg.id || i} className={`msg-row ${isMine ? 'sent' : 'recv'}`}>
              <div className="bubble">{msg.content}</div>
              <div className="msg-time">
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div className="chat-input-bar">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder={`Message ${otherParty?.name || ''}...`}
        />
        <button className="send-btn" onClick={sendMessage} disabled={!text.trim() || sending}>
          <i className="ti ti-send"/>
        </button>
      </div>

      {/* Menu overlay dismiss */}
      {showMenu && <div style={{ position:'absolute', inset:0, zIndex:99 }} onClick={() => setShowMenu(false)}/>}
    </>
  )
}
