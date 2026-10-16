'use client';

import { useEffect, useRef, useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { ArrowUpRight, ArrowRight, ArrowLeft, Check, CheckCheck, BookOpen, X, RotateCcw, Leaf, Code2, LogOut } from 'lucide-react';
import Link from 'next/link';
import type { Journey, JourneyId } from '@/lib/journeys';
import { nextPair, normalizeProgress, type Progress } from '@/lib/progress';
import Feedback from '../feedback';
import Collection from './collection';
import { difficulties, filterCards, type DifficultyFilter } from '@/lib/collection';



export default function PracticeClient({ journeyId, journey }: { journeyId: JourneyId; journey: Journey }) {
  const { problems, localKey } = journey;
  const pairs = filterCards(problems, 'All').map(card => card.problems);
  const normalize = (value: unknown) => normalizeProgress(value, problems);
  const { data: session, status: authStatus } = useSession();
  const [progress, setProgress] = useState<Progress>(() => normalize(null));
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [modal, setModal] = useState<'collection' | null>(null);
  const [revision, setRevision] = useState(false);
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('All');
  const [filteredPair, setFilteredPair] = useState<number | null>(null);
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
    if (authStatus === 'loading') return;
    let active = true;
    const version = ++generation.current;
    setReady(false); setRevision(false); setError('');

    async function load() {
      if (session?.user?.id) {
        try {
          const response = await fetch(`/api/progress?module=${journey.module}`, { cache: 'no-store' });
          if (!response.ok) {
            const result = await response.json().catch(() => null);
            throw new Error(result?.error || 'Progress could not be loaded.');
          }
          const result = await response.json();
          if (!active || version !== generation.current) return;

          if (result.progress) {
            setProgress(normalize(result.progress));
            setSaveStatus('Synced to your account');
          } else {
            const localValue = localStorage.getItem(localKey);
            const localProgress = normalize(JSON.parse(localValue || 'null'));
            setProgress(localProgress);
            if (localValue) {
              const migration = await fetch('/api/progress', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ module: journey.module, progress: localProgress }),
              });
              if (!migration.ok) throw new Error('Local progress could not be migrated.');
              setSaveStatus('Synced to your account');
            } else {
              setSaveStatus('No account progress saved yet');
            }
          }
        } catch (error) {
          if (active) {
            setError(error instanceof Error ? error.message : 'Could not load account progress. Please try again.');
            setSaveStatus('Account progress unavailable');
          }
          return;
        }
      } else {
        try {
          setProgress(normalize(JSON.parse(localStorage.getItem(localKey) || 'null')));
          setSaveStatus('Saved on this device');
        } catch {
          setProgress(normalize(null));
          setSaveStatus('Device storage unavailable');
        }
      }

      if (active && version === generation.current) setReady(true);
    }

    void load();
    return () => { active = false; };
  }, [authStatus, session?.user?.id, journeyId]);

  async function commit(next: Progress) {
    if (saving.current || !ready) return;
    saving.current = true; setBusy(true); setError('');
    const version = generation.current;
    try {
      if (session?.user?.id) {
        const response = await fetch('/api/progress', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ module: journey.module, progress: next }),
        });
        if (!response.ok) throw new Error('Progress could not be saved.');
      } else {
        localStorage.setItem(localKey, JSON.stringify(next));
      }
      if (version === generation.current) {
        setProgress(next);
        setSaveStatus(session?.user?.id ? 'Synced to your account' : 'Saved on this device');
      }
    } catch {
      setError('Progress could not be saved. Please try again.');
    } finally {
      saving.current = false; setBusy(false);
    }
  }

  const matchingCards = filterCards(problems, difficulty);
  const filtered = difficulty !== 'All';
  const currentIndex = filtered ? (matchingCards.find(card => card.index === filteredPair)?.index ?? matchingCards.find(card => card.index === progress.pair)?.index ?? matchingCards[0]?.index ?? -1) : progress.pair;
  const current = pairs[currentIndex] ?? [];
  const matchPosition = matchingCards.findIndex(card => card.index === currentIndex);
  const solvedCount = problems.filter(problem => progress.solved.includes(problem.id)).length;
  const complete = solvedCount === problems.length;
  const pairDone = current.every(p => progress.solved.includes(p.id));

  function move(direction: 1 | -1) {
    if (filtered) {
      const next = matchingCards[matchPosition + direction];
      if (next) setFilteredPair(next.index);
      return;
    }
    const pair = nextPair(progress, direction, problems);
    if (pair === progress.pair) return;
    void commit({ ...progress, pair });
  }

  async function handleSignOut() {
    try { localStorage.setItem(localKey, JSON.stringify(progress)); } catch { /* Keep the account copy if local storage is unavailable. */ }
    await signOut();
  }

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="/" aria-label="Pairwise home"><span className="brand-mark"><span /><span /></span>pairwise<span className="brand-period">.</span></a>
      <div className="header-right"><a className="module-link" href="/genai">The GenAI Edition <ArrowUpRight size={14}/></a><span className="edition">THE INTERVIEW EDITION</span>{session?.user ? <button className="account" onClick={() => void handleSignOut()} title="Sign out"><span>{session.user.name || session.user.email || 'Signed in'}</span><LogOut size={15}/></button> : <button className="sign-in" onClick={() => void signIn('google')} disabled={authStatus === 'loading'}>Sign in with Google <ArrowUpRight size={15}/></button>}</div>
    </header>
    <main>
      <nav className="journey-back"><Link href="/practice"><ArrowLeft size={14}/> All journeys</Link><span>{journey.title}</span></nav><section className="intro"><div className="eyebrow"><span className="live-dot"/> A LITTLE EVERY DAY GOES A LONG WAY</div><h1>Big interviews.<br/>Small, steady <em>steps.</em></h1><p>{journey.description}</p></section>
      <section className="practice-area" aria-label="Practice dashboard">{journeyId !== 'foundations' && <p className="journey-source-note">{'Every question links to a first-person candidate account. Historical reports are not independently verified; variations are labeled.'} <button className="text-button" onClick={() => setModal('collection')}>About the sources <ArrowUpRight size={13}/></button></p>}
        <div className="section-heading"><div className="section-label"><span className="tiny-square"/> {journey.title}</div><div className="solved-counter"><CheckCheck size={16}/><strong>{solvedCount}</strong><span>problems solved</span></div></div>
        <div className="progress-track" role="progressbar" aria-label="Collection progress" aria-valuenow={solvedCount} aria-valuemin={0} aria-valuemax={problems.length}><span style={{ width: `${solvedCount / problems.length * 100}%` }}/></div>
        <div className="card-filter-bar"><div className="section-label">FILTER CARDS</div><div className="difficulty-filters" role="group" aria-label="Filter practice cards by difficulty">{difficulties.map(value => <button type="button" key={value} aria-pressed={difficulty === value} disabled={busy} onClick={() => { setDifficulty(value); setFilteredPair(null); }}>{value}<span>{filterCards(problems, value).length}</span></button>)}</div></div>
        <p className="card-filter-summary" role="status">{filtered ? `${matchingCards.length} ${difficulty.toLowerCase()} cards · Every problem matches this difficulty` : `${pairs.length} cards · Easy → Medium → Hard${pairs.some(pair => pair.length === 1) ? ` | ${pairs.filter(pair => pair.length === 1).length} solo card${pairs.filter(pair => pair.length === 1).length === 1 ? '' : 's'}` : ' · Two problems per card'}`}</p>
        {current.length === 0 ? <section className="welcome-card"><h2>No matching cards</h2><p>Choose another difficulty to continue practicing.</p><button className="primary" onClick={() => setDifficulty('All')}>Show all cards</button></section> : complete && !revision && !filtered ? <section className="welcome-card"><CheckCheck size={36}/><div className="eyebrow">{problems.length} SMALL STEPS. REAL PROGRESS.</div><h2>You finished the collection.</h2><p>Make the patterns stick. Revisit a pair and explain your approach out loud.</p><button className="primary" onClick={() => setRevision(true)}>Start a revision round <RotateCcw size={16}/></button></section> : <article className="practice-card">
          <div className="card-heading"><div><div className="pair-kicker">{filtered ? `${difficulty.toUpperCase()} PRACTICE · CARD ${matchPosition + 1} OF ${matchingCards.length}` : revision ? 'REVISION' : 'A FRESH LITTLE CHALLENGE'}</div><h2>{current.length === 1 ? 'Your solo challenge' : filtered ? 'Your practice pair' : revision ? 'Revisit your pair' : 'Your next two' }<span className="small-period">.</span></h2></div><span className="pair-number">CARD {String(currentIndex + 1).padStart(2, '0')} <span>/ {pairs.length}</span></span></div>
          <div className="problems">{current.map((problem, i) => { const done = progress.solved.includes(problem.id); return <div className={`problem ${done ? 'is-done' : ''}`} key={problem.id}>
            <span className="problem-number">{String(pairs.slice(0, currentIndex).reduce((count, pair) => count + pair.length, 0) + i + 1).padStart(2, '0')}</span><div className="problem-main"><div className="tags"><span className={`difficulty ${problem.difficulty.toLowerCase()}`}>{problem.difficulty}</span><span className="tag-dot">·</span><span>{problem.topic}</span></div><h3>{problem.title}</h3><p>{problem.note}</p><div className="problem-links"><a className="solve-link" href={problem.url} target="_blank" rel="noopener noreferrer"><Code2 size={15}/> {problem.evidence?.match === 'Reported task' ? 'Read original prompt' : `Open ${problem.platform}`} <ArrowUpRight size={14}/></a>{journeyId !== 'foundations' && <a className="solve-link" href={problem.source} target="_blank" rel="noopener noreferrer">{problem.sourceKind} <ArrowUpRight size={14}/></a>}{problem.evidence?.match === 'Reported variation' && <span className="variation-label">Related variation</span>}<span className="estimate">~{problem.minutes} min</span>{problem.premium && <span className="premium-label">LeetCode Premium</span>}</div>{problem.evidence && <details className="source-details"><summary>Source details</summary><div className="problem-evidence"><p>{problem.evidence.summary}</p><a href={problem.source} target="_blank" rel="noopener noreferrer">{problem.evidence.title} <ArrowUpRight size={13}/></a><small>{problem.evidence.context}<br/>{problem.evidence.date}<br/>Source reviewed {problem.evidence.checkedOn}</small></div></details>}</div>
            <button className={`done-button ${done ? 'checked' : ''}`} aria-label={`${done ? 'Mark unsolved' : 'Mark solved'}: ${problem.title}`} aria-pressed={done} disabled={!ready || busy} onClick={() => void commit({ ...progress, solved: done ? progress.solved.filter(id => id !== problem.id) : [...progress.solved, problem.id] })}><span className="checkbox">{done && <Check size={13} strokeWidth={3}/>}</span><span>{done ? 'Solved' : 'Mark done'}</span></button>
          </div>; })}</div>
          <div className="card-footer"><span className={pairDone ? 'pair-complete' : ''}>{pairDone ? <CheckCheck size={16}/> : <Leaf size={16}/>}<span>{pairDone ? 'Nice work. Another step forward.' : filtered ? 'Browse matching cards at your own pace.' : current.length === 1 ? 'Mark this problem done to unlock the next card.' : 'Mark both problems done to unlock the next card.'}</span></span><div className="pair-navigation"><button className="previous" aria-label="Previous card" disabled={!ready || busy || (filtered ? matchPosition <= 0 : progress.pair === 0)} onClick={() => move(-1)}><ArrowLeft size={16}/></button><button className="primary" disabled={!ready || busy || (filtered ? matchPosition === matchingCards.length - 1 : !pairDone || progress.pair === pairs.length - 1)} onClick={() => move(1)}>{filtered ? 'Next match' : 'Next card'} <ArrowRight size={16}/></button></div></div>
        </article>}
        {error && !modal && <p className="error" role="alert">{error}</p>}
        <div className="below-card"><span><span className="save-dot"/>{!ready ? 'Loading your progress…' : saveStatus}{!session?.user ? ' · Local preview' : ''}</span><button className="text-button" onClick={() => setModal('collection')}><BookOpen size={14}/> Explore the collection <ArrowUpRight size={13}/></button></div>
      </section>
      <section className="bottom-note"><span className="note-line"/><span>Less scrolling. More solving.</span><span className="note-line"/></section>
    </main>
    <footer className="site-footer"><span>Built for your next chapter.</span><Feedback pair={currentIndex < 0 ? progress.pair : currentIndex}/><span>MAANG + ATLASSIAN <span className="footer-dot">·</span> ONE PAIR AT A TIME</span></footer>
    {modal && <div className="modal-backdrop" onClick={() => setModal(null)}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="dialog-title" onClick={e => e.stopPropagation()}><button ref={closeRef} className="close" aria-label="Close dialog" onClick={() => setModal(null)}><X size={20}/></button><div className="eyebrow">A FOCUSED START</div><h2 id="dialog-title">The collection<span className="small-period">.</span></h2><p>{journey.collectionNote}</p><Collection problems={problems} progress={progress} disabled={busy || !ready} onPair={index => { setDifficulty('All'); setFilteredPair(null); setRevision(pairs[index].every(p => progress.solved.includes(p.id))); void commit({ ...progress, pair: index }); setModal(null); }}/>{error && <p className="error" role="alert">{error}</p>}<div className="sources"><p>Sources are linked with the problems. Company entries include the report context and explain how the exercise matches it. Premium exercises are marked.</p>{journeyId === 'foundations' && Array.from(new Set(problems.map(problem => problem.source))).map((source, index) => <a key={source} href={source} target="_blank" rel="noopener noreferrer">Collection source {index + 1} <ArrowUpRight size={13}/></a>)}</div></section></div>}
  </div>;
}
