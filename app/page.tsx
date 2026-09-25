'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ArrowRight, ArrowLeft, Check, CheckCheck, BookOpen, X, RotateCcw, Leaf, Code2 } from 'lucide-react';
import { pairs, problems } from '@/lib/problems';
import { emptyProgress, nextPair, normalizeProgress, type Progress } from '@/lib/progress';
import Feedback from './feedback';

const localKey = 'pairwise-preview-v1';

export default function Home() {
  const [progress, setProgress] = useState<Progress>(emptyProgress);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [modal, setModal] = useState<'collection' | null>(null);
  const [revision, setRevision] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const generation = useRef(0);
  const saving = useRef(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!modal) return;
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setModal(null);
      if (e.key === 'Tab') {
        const elements = Array.from(document.querySelectorAll<HTMLElement>('[role="dialog"] button, [role="dialog"] a[href]')).filter(el => !el.hasAttribute('disabled'));
        const first = elements[0], last = elements.at(-1);
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
        if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    }
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); previous?.focus(); };
  }, [modal]);

  useEffect(() => {
    let active = true;
    const version = ++generation.current;
    setReady(false); setRevision(false); setError('');
    try {
      const saved = JSON.parse(localStorage.getItem(localKey) || 'null');
      setProgress(normalizeProgress(saved));
      setSaveStatus('Saved on this device');
    } catch {
      setProgress(emptyProgress);
      setSaveStatus('Device storage unavailable');
    }
    if (active && version === generation.current) setReady(true);
    return () => { active = false; };
  }, []);

  async function commit(next: Progress) {
    if (saving.current || !ready) return;
    saving.current = true; setBusy(true); setError('');
    const version = generation.current;
    try {
      localStorage.setItem(localKey, JSON.stringify(next));
      if (version === generation.current) {
        setProgress(next);
        setSaveStatus('Saved on this device');
      }
    } catch {
      setError('Progress could not be saved. Please try again.');
    } finally {
      saving.current = false; setBusy(false);
    }
  }

  const current = pairs[progress.pair];
  const solvedCount = progress.solved.length;
  const complete = solvedCount === problems.length;
  const pairDone = current.every(p => progress.solved.includes(p.id));

  function move(direction: 1 | -1) {
    const pair = nextPair(progress, direction);
    if (pair === progress.pair) return;
    void commit({ ...progress, pair });
  }

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="/" aria-label="Pairwise home"><span className="brand-mark"><span /><span /></span>pairwise<span className="brand-period">.</span></a>
      <div className="header-right"><a className="module-link" href="/genai">GenAI roadmap <ArrowUpRight size={14}/></a><span className="edition">THE INTERVIEW EDITION</span><span className="status-chip">Local preview</span></div>
    </header>
    <main>
      <section className="intro"><div className="eyebrow"><span className="live-dot"/> A LITTLE EVERY DAY GOES A LONG WAY</div><h1>Big interviews.<br/>Small, steady <em>steps.</em></h1><p>Your quiet corner to prepare for MAANG + Atlassian.<br className="desktop-break"/> Two problems at a time. One step closer.</p></section>
      <section className="practice-area" aria-label="Practice dashboard">
        <div className="section-heading"><div className="section-label"><span className="tiny-square"/> YOUR PRACTICE</div><div className="solved-counter"><CheckCheck size={16}/><strong>{solvedCount}</strong><span>problems solved</span></div></div>
        <div className="progress-track" role="progressbar" aria-label="Collection progress" aria-valuenow={solvedCount} aria-valuemin={0} aria-valuemax={problems.length}><span style={{ width: `${solvedCount / problems.length * 100}%` }}/></div>
        {complete && !revision ? <section className="welcome-card"><CheckCheck size={36}/><div className="eyebrow">32 SMALL STEPS. REAL PROGRESS.</div><h2>You finished the collection.</h2><p>Make the patterns stick. Revisit a pair and explain your approach out loud.</p><button className="primary" onClick={() => setRevision(true)}>Start a revision round <RotateCcw size={16}/></button></section> : <article className="practice-card">
          <div className="card-heading"><div><div className="pair-kicker">{revision ? 'REVISION' : 'A FRESH LITTLE CHALLENGE'}</div><h2>{revision ? 'Revisit your pair' : 'Your next two' }<span className="small-period">.</span></h2></div><span className="pair-number">PAIR {String(progress.pair + 1).padStart(2, '0')} <span>/ {pairs.length}</span></span></div>
          <div className="problems">{current.map((problem, i) => { const done = progress.solved.includes(problem.id); return <div className={`problem ${done ? 'is-done' : ''}`} key={problem.id}>
            <span className="problem-number">{String(progress.pair * 2 + i + 1).padStart(2, '0')}</span><div className="problem-main"><div className="tags"><span className={`difficulty ${problem.difficulty.toLowerCase()}`}>{problem.difficulty}</span><span className="tag-dot">·</span><span>{problem.topic}</span></div><h3>{problem.title}</h3><p>{problem.note}</p><div className="problem-links"><a className="solve-link" href={problem.url} target="_blank" rel="noopener noreferrer"><Code2 size={15}/> Open {problem.platform} <ArrowUpRight size={14}/></a><span className="estimate">~{problem.minutes} min</span></div></div>
            <button className={`done-button ${done ? 'checked' : ''}`} aria-label={`${done ? 'Mark unsolved' : 'Mark solved'}: ${problem.title}`} aria-pressed={done} disabled={!ready || busy} onClick={() => void commit({ ...progress, solved: done ? progress.solved.filter(id => id !== problem.id) : [...progress.solved, problem.id] })}><span className="checkbox">{done && <Check size={13} strokeWidth={3}/>}</span><span>{done ? 'Solved' : 'Mark done'}</span></button>
          </div>; })}</div>
          <div className="card-footer"><span className={pairDone ? 'pair-complete' : ''}>{pairDone ? <CheckCheck size={16}/> : <Leaf size={16}/>}<span>{pairDone ? 'Nice work. Another step forward.' : 'Mark both problems done to unlock the next pair.'}</span></span><div className="pair-navigation"><button className="previous" aria-label="Previous pair" disabled={!ready || busy || progress.pair === 0} onClick={() => move(-1)}><ArrowLeft size={16}/></button><button className="primary" disabled={!ready || busy || !pairDone || progress.pair === pairs.length - 1} onClick={() => move(1)}>Next pair <ArrowRight size={16}/></button></div></div>
        </article>}
        {error && !modal && <p className="error" role="alert">{error}</p>}
        <div className="below-card"><span><span className="save-dot"/>{!ready ? 'Loading your progress…' : saveStatus}</span><button className="text-button" onClick={() => setModal('collection')}><BookOpen size={14}/> Explore the collection <ArrowUpRight size={13}/></button></div>
      </section>
      <section className="bottom-note"><span className="note-line"/><span>Less scrolling. More solving.</span><span className="note-line"/></section>
    </main>
    <footer className="site-footer"><span>Built for your next chapter.</span><Feedback pair={progress.pair}/><span>MAANG + ATLASSIAN <span className="footer-dot">·</span> ONE PAIR AT A TIME</span></footer>
    {modal && <div className="modal-backdrop" onClick={() => setModal(null)}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="dialog-title" onClick={e => e.stopPropagation()}><button ref={closeRef} className="close" aria-label="Close dialog" onClick={() => setModal(null)}><X size={20}/></button><div className="eyebrow">A FOCUSED START</div><h2 id="dialog-title">The collection<span className="small-period">.</span></h2><p>32 problems across core interview patterns. Foundations from LeetCode, plus practice drawn from reported Atlassian interviews. This is a starter set, not an official company question bank.</p><div className="collection-list">{pairs.map((pair, index) => <button key={index} disabled={busy || !ready} onClick={() => { setRevision(pair.every(p => progress.solved.includes(p.id))); void commit({ ...progress, pair: index }); setModal(null); }}><span>{String(index + 1).padStart(2, '0')}</span><div><strong>{pair[0].topic === pair[1].topic ? pair[0].topic : `${pair[0].topic} / ${pair[1].topic}`}</strong><small>{pair.map(p => p.title).join(' · ')}</small></div><span>{pair.filter(p => progress.solved.includes(p.id)).length}/2</span></button>)}</div><div className="sources"><a href="https://leetcode.com/studyplan/top-interview-150/" target="_blank" rel="noopener noreferrer">LeetCode study plan ↗</a><a href={problems[30].source} target="_blank" rel="noopener noreferrer">Atlassian experience: windows ↗</a><a href={problems[31].source} target="_blank" rel="noopener noreferrer">Atlassian experience: scheduling ↗</a></div></section></div>}
  </div>;
}

