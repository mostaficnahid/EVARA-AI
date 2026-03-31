import { useState, useRef, useEffect } from 'react';
import { useAIStore, useEventsStore } from '../store';
import { aiAPI } from '../api';

const QUICK_PROMPTS = [
  { label: '🎯 Plan a conference', text: 'Help me plan a tech conference for 200 people' },
  { label: '🏛️ Venue ideas', text: 'Suggest venues for a gala dinner in New York City' },
  { label: '📋 Create agenda', text: 'Create a full-day workshop agenda with sessions and breaks' },
  { label: '💡 Engagement tips', text: 'How do I maximize attendee engagement at my events?' },
  { label: '📊 Analyze events', text: 'Analyze my current event portfolio and give recommendations' },
  { label: '💰 Budget guide', text: 'How should I allocate budget for a 150-person corporate gala?' },
];

interface Props { onClose: () => void; }

export default function AIPanel({ onClose }: Props) {
  const { messages, isThinking, addMessage, setThinking, clearChat } = useAIStore();
  const { events } = useEventsStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const send = async (text?: string) => {
    const content = (text || input).trim();
    if (!content || isThinking) return;
    setInput('');

    const userMsg = { role: 'user' as const, content, timestamp: new Date() };
    addMessage(userMsg);
    setThinking(true);

    try {
      const history = [...messages, userMsg].slice(-12).map(m => ({ role: m.role, content: m.content }));
      const { data } = await aiAPI.chat(history, events.length ? { recentEvents: events.slice(0, 5) } : undefined);
      addMessage({ role: 'assistant', content: data.reply, timestamp: new Date() });
    } catch {
      addMessage({ role: 'assistant', content: 'Sorry, I encountered an error. Please try again.', timestamp: new Date() });
    } finally {
      setThinking(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div style={{ width: 340, minWidth: 340, borderLeft: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--gold)', animation: 'pulse 2s infinite', flexShrink: 0 }} />
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gold)' }}>AI Event Assistant</div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          {messages.length > 0 && (
            <button className="btn btn-ghost btn-icon btn-sm" onClick={clearChat} title="Clear chat" style={{ fontSize: 12 }}>↺</button>
          )}
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose} style={{ fontSize: 16 }}>✕</button>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 16px', color: 'var(--text-dim)' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>✦</div>
            <div style={{ color: 'var(--gold)', fontSize: 14, marginBottom: 6, fontFamily: 'Playfair Display, serif' }}>Evara AI Assistant</div>
            <div style={{ fontSize: 12, lineHeight: 1.6 }}>Ask me to plan events, suggest venues, create agendas, manage guests, or analyze your event portfolio.</div>
          </div>
        ) : messages.map((msg, i) => (
          <div key={i} style={{ maxWidth: '90%', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', animation: 'fadeIn 0.3s ease' }}>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 4, letterSpacing: 0.5 }}>
              {msg.role === 'user' ? 'You' : '✦ Evara AI'}
            </div>
            <div style={{
              padding: '10px 13px', borderRadius: msg.role === 'user' ? '10px 3px 10px 10px' : '3px 10px 10px 10px',
              fontSize: 12.5, lineHeight: 1.6,
              background: msg.role === 'user' ? 'var(--gold-dim)' : 'var(--surface2)',
              border: `1px solid ${msg.role === 'user' ? 'var(--gold-border)' : 'var(--border)'}`,
              color: 'var(--text)',
              whiteSpace: 'pre-wrap',
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {isThinking && (
          <div style={{ alignSelf: 'flex-start', maxWidth: '90%' }}>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 4 }}>✦ Evara AI</div>
            <div style={{ padding: '12px 16px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '3px 10px 10px 10px', display: 'flex', gap: 4, alignItems: 'center' }}>
              {[0, 0.2, 0.4].map((delay, i) => (
                <span key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--gold)', display: 'block', animation: `bounce 1.2s ${delay}s infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p.label}
              onClick={() => send(p.text)}
              disabled={isThinking}
              style={{
                fontSize: 11, padding: '4px 10px', borderRadius: 20,
                background: 'var(--surface2)', border: '1px solid var(--border)',
                color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s',
                fontFamily: 'DM Sans, sans-serif',
              }}
              onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = 'var(--gold)'; (e.target as HTMLElement).style.color = 'var(--gold)'; }}
              onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = 'var(--border)'; (e.target as HTMLElement).style.color = 'var(--text-muted)'; }}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <textarea
            ref={inputRef}
            className="form-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask the AI assistant..."
            rows={1}
            style={{ resize: 'none', height: 40, lineHeight: '22px', paddingTop: 8 }}
          />
          <button
            className="btn btn-gold btn-icon"
            onClick={() => send()}
            disabled={isThinking || !input.trim()}
            style={{ flexShrink: 0 }}
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
