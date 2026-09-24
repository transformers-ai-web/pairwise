'use client';

import { useEffect, useRef, useState } from 'react';
import { Copy, MessageSquare, Send, X } from 'lucide-react';

const email = process.env.NEXT_PUBLIC_FEEDBACK_EMAIL?.trim();
const repository = process.env.NEXT_PUBLIC_FEEDBACK_GITHUB_REPO?.trim();
const validEmail = email && /^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(email) ? email : null;
const validRepository = repository && /^[\w.-]+\/[\w.-]+$/.test(repository) ? repository : null;

export default function Feedback({ pair }: { pair: number }) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState('Suggestion');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [copying, setCopying] = useState(false);
  const dialogRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
      if (event.key !== 'Tab') return;
      const controls = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), select, textarea, a[href]') ?? []);
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = previousOverflow;
      triggerRef.current?.focus();
    };
  }, [open]);

  const body = `Pairwise feedback\nType: ${category}\nPractice pair: ${pair + 1}\n\n${message.trim()}`;
  const subject = `[Pairwise] ${category}`;
  const destination = validEmail
    ? `mailto:${validEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    : validRepository ? `https://github.com/${validRepository}/issues/new?title=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}` : null;
  async function copy() {
    setCopying(true);
    try { await navigator.clipboard.writeText(body); setStatus('Copied. Paste it into a message to share it.'); }
    catch { inputRef.current?.focus(); inputRef.current?.select(); setStatus('Copy is unavailable. Your message is selected so you can copy it manually.'); }
    finally { setCopying(false); }
  }

  return <>
    <button ref={triggerRef} className="text-button feedback-trigger" onClick={() => { setOpen(true); setStatus(''); }}><MessageSquare size={14}/> Feedback</button>
    {open && <div className="modal-backdrop" onClick={() => setOpen(false)}>
      <section ref={dialogRef} className="modal feedback-modal" role="dialog" aria-modal="true" aria-labelledby="feedback-title" aria-describedby="feedback-description" onClick={event => event.stopPropagation()}>
        <button className="close" aria-label="Close feedback" onClick={() => setOpen(false)}><X size={20}/></button>
        <span className="modal-icon"><MessageSquare size={24}/></span>
        <h2 id="feedback-title">A little feedback<span className="small-period">.</span></h2>
        <p id="feedback-description">Found a broken link? Have an idea? Help make this corner a little better.</p>
        <form className="feedback-form" onSubmit={event => { event.preventDefault(); if (!message.trim()) return; if (destination) { window.open(destination, '_blank', 'noopener,noreferrer'); setStatus(validEmail ? 'Finish sending in your email app. Your message is still here if it did not open.' : 'Review and submit on GitHub. Your feedback has not been posted yet.'); } else { void copy(); } }}>
          <label htmlFor="feedback-category">What is it about?</label>
          <select id="feedback-category" value={category} onChange={event => { setCategory(event.target.value); setStatus(''); }}><option>Suggestion</option><option>Broken problem link</option><option>Bug</option><option>Something else</option></select>
          <label htmlFor="feedback-message">Your feedback</label>
          <textarea ref={inputRef} id="feedback-message" placeholder="It would be helpful if…" rows={5} maxLength={1500} required value={message} onChange={event => { setMessage(event.target.value); setStatus(''); }} aria-describedby="feedback-help"/>
          <div className="feedback-meta"><span>About pair {String(pair + 1).padStart(2, '0')}</span><span>{message.length}/1500</span></div>
          <p id="feedback-help" className="feedback-help">{validEmail ? 'Opens your email app with a draft for you to send.' : validRepository ? 'Opens a GitHub issue draft. A GitHub account is required; submitted feedback may be public.' : 'Direct sending is not available yet. Copy your feedback and share it with the person who sent you this app.'}</p>
          <button className="primary" type="submit" disabled={!message.trim() || copying}>{destination ? <Send size={14}/> : <Copy size={14}/>} {validEmail ? 'Open email draft' : validRepository ? 'Continue on GitHub' : copying ? 'Copying…' : 'Copy feedback'}</button>
          <p className="feedback-status" role="status">{status}</p>
        </form>
      </section>
    </div>}
  </>;
}
