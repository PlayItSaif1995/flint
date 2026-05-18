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
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    loadMatch()
    loadMessages()
    markRead()

    const channel = supabase.channel(`chat:${matchId}`)
      .on('postgres_changes', { event:'INSERT', schema:'public', table:'messages', filter:`match_id=eq.${matchId}` }, payload => {
        setMessages(prev => [...prev, payload.new])
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior:'smooth' }), 50)
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [matchId])

  async function loadMatch() {
    const { data } = await supabase.from('matches').select('*, jobs(title, companies(name)), employer_profile:profiles!matches_employer_id_fkey(full_name)').eq('id', matchId).single()
    setMatchInfo(data)
  }

  async function loadMessages() {
    const { data } = await supabase.from('messages').select('*').eq('match_id', matchId).order('created_at', { ascending:true })
    setMessages(data || [])
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior:'smooth' }), 50)
  }

  async function markRead() {
    const field = profile?.role === 'candidate' ? 'candidate_read' : 'employer_read'
    await supabase.from('matches').update({ [field]: true }).eq('id', matchId)
  }

  async function sendMessage() {
    if (!text.trim() || sending) return
    setSending(true)
    const msg = { match_id: matchId, sender_id: user.id, content: text.trim(), sender_role: profile?.role }
    setText('')
    const { error } = await supabase.from('messages').insert(msg)
    if (!error) {
      const otherField = profile?.role === 'candidate' ? 'employer_read' : 'candidate_read'
      await supabase.from('matches').update({ last_message: msg.content, last_message_at: new Date().toISOString(), [otherField]: false }).eq('id', matchId)
    }
    setSending(false)
  }

  function handleKey(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }

  const isCandidate = profile?.role === 'candidate'
  const backPath = isCandidate ? '/sparks' : '/employer/sparks'
  const otherName = isCandidate ? (matchInfo?.jobs?.companies?.name || 'Employer') : 'Candidate'
  const subtitle = matchInfo?.jobs?.title || 'Mutual spark'

  return (
    <>
      <div className="status-bar" style={{ background:'var(--bg2)' }}><span>9:41</span><div className="status-icons"><i className="ti ti-wifi"/><i className="ti ti-battery-2"/></div></div>
      <div className="chat-header">
        <button onClick={() => nav(backPath)} style={{ background:'none', border:'none', cursor:'pointer' }}>
          <i className="ti ti-arrow-left" style={{ fontSize:18, color:'var(--t2)' }}/>
        </button>
        <div style={{ width:32, height:32, borderRadius:8, background:'#4F46E5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:500, color:'#fff', flexShrink:0 }}>
          {otherName.substring(0,2).toUpperCase()}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, fontWeight:500, color:'#fff' }}>{otherName}</div>
          <div style={{ fontSize:10, color:'var(--spark)' }}>{subtitle} · Mutual spark</div>
        </div>
        <i className="ti ti-dots-vertical" style={{ fontSize:17, color:'var(--t2)', cursor:'pointer' }}/>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="system-msg"><i className="ti ti-flame" style={{ fontSize:11, color:'var(--spark)' }}/>Mutual spark — both sides said yes</div>
        )}
        {messages.map((msg, i) => {
          const isMine = msg.sender_id === user.id
          return (
            <div key={msg.id || i} className={`msg-row ${isMine ? 'sent' : 'recv'}`}>
              <div className="bubble">{msg.content}</div>
              <div className="msg-time">{new Date(msg.created_at).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}</div>
            </div>
          )
        })}
        <div ref={bottomRef}/>
      </div>

      <div className="chat-input-bar">
        <button style={{ background:'none', border:'none', cursor:'pointer' }}>
          <i className="ti ti-paperclip" style={{ fontSize:18, color:'var(--t3)' }}/>
        </button>
        <input value={text} onChange={e => setText(e.target.value)} onKeyDown={handleKey} placeholder={`Message ${otherName}...`}/>
        <button className="send-btn" onClick={sendMessage} disabled={!text.trim() || sending}>
          <i className="ti ti-send"/>
        </button>
      </div>
    </>
  )
}
