'use client';

import { useEffect, useRef, useState } from 'react';

type Actions = { whatsapp?: string; mailto?: string; call?: string };
type Msg = { role: 'user' | 'assistant'; content: string; actions?: Actions };

const GREETING: Msg = {
  role: 'assistant',
  content: 'Vanakkam! 🙏 I can help you plan a feast — suggest dishes, explain wedding/corporate/private packages, and take down your enquiry. What are you celebrating?',
};

const SUGGESTIONS = ['Suggest a wedding menu', 'Corporate lunch for 300', 'What sweets do you serve?'];

// Lightweight, safe markdown: renders **bold** and line breaks as React nodes.
function formatInline(line: string) {
  return line.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((seg, i) => {
    const m = /^\*\*([^*]+)\*\*$/.exec(seg);
    return m ? <strong key={i}>{m[1]}</strong> : <span key={i}>{seg}</span>;
  });
}

function renderContent(text: string) {
  return text
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line, i) => <span key={i} className="chat-line">{formatInline(line)}</span>);
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy, open]);

  const send = async (text: string) => {
    const clean = text.trim();
    if (!clean || busy) return;
    const next = [...messages, { role: 'user' as const, content: clean }];
    // Add an empty assistant bubble we fill in as tokens stream back.
    setMessages([...next, { role: 'assistant', content: '' }]);
    setInput('');
    setBusy(true);

    const patchLast = (content: string, actions?: Actions) =>
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: 'assistant', content, actions };
        return copy;
      });

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      });
      if (!res.body) {
        const data = await res.json().catch(() => ({}));
        patchLast(data.reply || 'Sorry, please try again.', data.actions || undefined);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let raw = '';
      // Stream: reply text, then optionally a trailing "\u0000{actions json}" frame.
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        raw += decoder.decode(value, { stream: true });
        const sep = raw.indexOf('\u0000');
        if (sep === -1) {
          patchLast(raw);
        } else {
          let actions: Actions | undefined;
          try { actions = JSON.parse(raw.slice(sep + 1)).actions; } catch { /* partial */ }
          patchLast(raw.slice(0, sep), actions);
        }
      }
      if (!raw) patchLast('Sorry, please try again.');
    } catch {
      patchLast('Network hiccup — please try again, or call 8012678719.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button className={`chat-fab${open ? ' open' : ''}`} onClick={() => setOpen((o) => !o)} aria-label={open ? 'Close chat' : 'Open chat'}>
        {open ? '✕' : <><span className="chat-fab-dot" />Chat with us</>}
      </button>

      <div className={`chat-panel${open ? ' open' : ''}`} role="dialog" aria-label="Samayal Concierge">
        <div className="chat-head">
          <div><b>Samayal Concierge</b><span>Feast planning · replies in seconds</span></div>
          <button onClick={() => setOpen(false)} aria-label="Close">✕</button>
        </div>

        <div className="chat-body" ref={scrollRef}>
          {messages.map((m, i) => (
            <div key={i} className={`chat-msg ${m.role}`}>
              {m.content
                ? renderContent(m.content)
                : (m.role === 'assistant' && <span className="typing"><i /><i /><i /></span>)}
              {m.actions && (m.actions.whatsapp || m.actions.mailto || m.actions.call) && (
                <div className="chat-actions">
                  {m.actions.whatsapp && <a href={m.actions.whatsapp} target="_blank" rel="noreferrer" className="ca ca-wa">Send on WhatsApp ↗</a>}
                  {m.actions.mailto && <a href={m.actions.mailto} className="ca ca-mail">Email the enquiry ↗</a>}
                  {m.actions.call && <a href={m.actions.call} className="ca ca-call">Call 80126 78719</a>}
                </div>
              )}
            </div>
          ))}
          {messages.length <= 1 && !busy && (
            <div className="chat-chips">
              {SUGGESTIONS.map((s) => <button key={s} onClick={() => send(s)}>{s}</button>)}
            </div>
          )}
        </div>

        <form className="chat-input" onSubmit={(e) => { e.preventDefault(); send(input); }}>
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about menus, dates, guests…" aria-label="Message" />
          <button type="submit" disabled={busy || !input.trim()} aria-label="Send">↑</button>
        </form>
      </div>
    </>
  );
}
