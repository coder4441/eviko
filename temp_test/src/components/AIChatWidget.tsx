'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const STORAGE_KEY = 'eviko_ai_chat_history';

function MarkdownText({ text }: { text: string }) {
  // Simple markdown renderer: bold, lists, line breaks
  const lines = text.split('\n');
  return (
    <div className="ai-msg-text">
      {lines.map((line, i) => {
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={i}><strong>{line.slice(2, -2)}</strong></p>;
        }
        if (line.startsWith('- ') || line.startsWith('• ')) {
          return <p key={i} style={{ paddingLeft: '12px' }}>• {parseBold(line.slice(2))}</p>;
        }
        if (line.trim() === '') return <br key={i} />;
        return <p key={i}>{parseBold(line)}</p>;
      })}
    </div>
  );
}

function parseBold(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  );
}

export default function AIChatWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load chat history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
    } catch {}
    // Default welcome message
    setMessages([{
      role: 'assistant',
      content: 'Salom! 👋 Men **EVIKO POS** tizimining yordamchisiman.\n\nTizim haqida savollaringizga javob beraman. Nima so\'rashni istaysiz?',
    }]);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-50))); // max 50 messages
      } catch {}
    }
  }, [messages]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setUnread(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Faqat asosiy landing sahifada ko'rinsin
  if (pathname !== '/') return null;

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();
      const aiMsg: Message = {
        role: 'assistant',
        content: data.reply || data.error || 'Xatolik yuz berdi.',
      };
      setMessages(prev => [...prev, aiMsg]);
      if (!isOpen) setUnread(true);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Tarmoq xatosi. Iltimos, qaytadan urinib ko\'ring.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
    setMessages([{
      role: 'assistant',
      content: 'Suhbat tozalandi. Yangi savol bering!',
    }]);
  };

  const quickQuestions = [
    'EVIKO nima?',
    'Kassir qanday ishlaydi?',
    'Narx qancha?',
    'Demo bormi?',
  ];

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(o => !o)}
        className="ai-chat-fab"
        aria-label="AI Yordamchi"
        title="EVIKO AI Yordamchi"
      >
        {isOpen ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <circle cx="9" cy="10" r="1" fill="currentColor" />
            <circle cx="12" cy="10" r="1" fill="currentColor" />
            <circle cx="15" cy="10" r="1" fill="currentColor" />
          </svg>
        )}
        {unread && !isOpen && <span className="ai-chat-badge" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="ai-chat-window">
          {/* Header */}
          <div className="ai-chat-header">
            <div className="ai-chat-header-info">
              <div className="ai-chat-avatar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
              </div>
              <div>
                <div className="ai-chat-header-title">EVIKO Yordamchi</div>
                <div className="ai-chat-header-status">
                  <span className="ai-chat-online-dot" />
                  Onlayn
                </div>
              </div>
            </div>
            <button onClick={clearHistory} className="ai-chat-clear" title="Suhbatni tozalash">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4h6v2" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="ai-chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`ai-chat-bubble-wrap ${msg.role === 'user' ? 'user' : 'ai'}`}>
                {msg.role === 'assistant' && (
                  <div className="ai-bubble-icon">🤖</div>
                )}
                <div className={`ai-chat-bubble ${msg.role === 'user' ? 'user' : 'ai'}`}>
                  {msg.role === 'assistant'
                    ? <MarkdownText text={msg.content} />
                    : <p>{msg.content}</p>
                  }
                </div>
              </div>
            ))}

            {loading && (
              <div className="ai-chat-bubble-wrap ai">
                <div className="ai-bubble-icon">🤖</div>
                <div className="ai-chat-bubble ai ai-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions (show only if 1 message = welcome) */}
          {messages.length === 1 && (
            <div className="ai-quick-btns">
              {quickQuestions.map(q => (
                <button key={q} className="ai-quick-btn" onClick={() => {
                  setInput(q);
                  setTimeout(() => sendMessage(), 50);
                }}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="ai-chat-input-area">
            <textarea
              ref={inputRef}
              className="ai-chat-input"
              placeholder="Savol yozing..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={loading}
            />
            <button
              className="ai-chat-send"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              aria-label="Yuborish"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
          <div className="ai-chat-footer">Gemini AI bilan ishlaydi • EVIKO</div>
        </div>
      )}

      <style jsx global>{`
        /* FAB Button */
        .ai-chat-fab {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 24px rgba(99,102,241,0.5);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .ai-chat-fab:hover {
          transform: scale(1.08);
          box-shadow: 0 6px 32px rgba(99,102,241,0.65);
        }
        .ai-chat-badge {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #f43f5e;
          border: 2px solid white;
          animation: ai-pulse 1.5s infinite;
        }
        @keyframes ai-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.3); }
        }

        /* Chat Window */
        .ai-chat-window {
          position: fixed;
          bottom: 92px;
          right: 24px;
          z-index: 9998;
          width: 360px;
          max-height: 540px;
          display: flex;
          flex-direction: column;
          border-radius: 20px;
          background: rgba(15, 15, 30, 0.96);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(99,102,241,0.3);
          box-shadow: 0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05) inset;
          overflow: hidden;
          animation: ai-window-in 0.25s cubic-bezier(.34,1.56,.64,1);
        }
        @keyframes ai-window-in {
          from { opacity: 0; transform: scale(0.92) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @media (max-width: 480px) {
          .ai-chat-window {
            width: calc(100vw - 32px);
            right: 16px;
            bottom: 88px;
          }
        }

        /* Header */
        .ai-chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          background: linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(139,92,246,0.15) 100%);
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .ai-chat-header-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .ai-chat-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }
        .ai-chat-header-title {
          font-size: 14px;
          font-weight: 700;
          color: #fff;
          letter-spacing: 0.02em;
        }
        .ai-chat-header-status {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          color: rgba(255,255,255,0.5);
          margin-top: 2px;
        }
        .ai-chat-online-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 6px #22c55e;
        }
        .ai-chat-clear {
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 6px;
          cursor: pointer;
          color: rgba(255,255,255,0.4);
          display: flex;
          align-items: center;
          transition: all 0.2s;
        }
        .ai-chat-clear:hover {
          background: rgba(244,63,94,0.2);
          color: #f43f5e;
          border-color: rgba(244,63,94,0.3);
        }

        /* Messages */
        .ai-chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          scrollbar-width: thin;
          scrollbar-color: rgba(99,102,241,0.3) transparent;
        }
        .ai-chat-messages::-webkit-scrollbar { width: 4px; }
        .ai-chat-messages::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.3); border-radius: 4px; }

        .ai-chat-bubble-wrap {
          display: flex;
          align-items: flex-end;
          gap: 7px;
        }
        .ai-chat-bubble-wrap.user { flex-direction: row-reverse; }
        .ai-bubble-icon { font-size: 18px; flex-shrink: 0; margin-bottom: 2px; }

        .ai-chat-bubble {
          max-width: 82%;
          padding: 10px 13px;
          border-radius: 16px;
          font-size: 13px;
          line-height: 1.55;
        }
        .ai-chat-bubble.ai {
          background: rgba(99,102,241,0.12);
          border: 1px solid rgba(99,102,241,0.2);
          color: rgba(255,255,255,0.88);
          border-bottom-left-radius: 4px;
        }
        .ai-chat-bubble.user {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          border-bottom-right-radius: 4px;
        }
        .ai-msg-text p { margin: 2px 0; }
        .ai-msg-text br { display: block; height: 6px; content: ''; }

        /* Typing animation */
        .ai-typing { display: flex; align-items: center; gap: 5px; padding: 12px 14px; }
        .ai-typing span {
          width: 7px; height: 7px; border-radius: 50%;
          background: rgba(99,102,241,0.7);
          animation: ai-typing-bounce 1.2s infinite;
        }
        .ai-typing span:nth-child(2) { animation-delay: 0.2s; }
        .ai-typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes ai-typing-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }

        /* Quick questions */
        .ai-quick-btns {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          padding: 0 14px 10px;
        }
        .ai-quick-btn {
          background: rgba(99,102,241,0.1);
          border: 1px solid rgba(99,102,241,0.25);
          border-radius: 20px;
          padding: 5px 12px;
          font-size: 12px;
          color: #a5b4fc;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .ai-quick-btn:hover {
          background: rgba(99,102,241,0.25);
          border-color: rgba(99,102,241,0.5);
          color: white;
        }

        /* Input */
        .ai-chat-input-area {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          padding: 10px 12px;
          border-top: 1px solid rgba(255,255,255,0.06);
          background: rgba(0,0,0,0.2);
        }
        .ai-chat-input {
          flex: 1;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 9px 12px;
          font-size: 13px;
          color: white;
          resize: none;
          outline: none;
          font-family: inherit;
          max-height: 100px;
          min-height: 36px;
          transition: border-color 0.2s;
        }
        .ai-chat-input::placeholder { color: rgba(255,255,255,0.3); }
        .ai-chat-input:focus { border-color: rgba(99,102,241,0.5); }

        .ai-chat-send {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .ai-chat-send:hover:not(:disabled) { transform: scale(1.05); box-shadow: 0 3px 14px rgba(99,102,241,0.5); }
        .ai-chat-send:disabled { opacity: 0.4; cursor: not-allowed; }

        /* Footer */
        .ai-chat-footer {
          text-align: center;
          font-size: 10px;
          color: rgba(255,255,255,0.2);
          padding: 6px;
          background: rgba(0,0,0,0.15);
        }
      `}</style>
    </>
  );
}
