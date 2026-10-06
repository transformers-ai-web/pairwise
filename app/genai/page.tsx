'use client';

import { useEffect, useRef, useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, CheckCheck, Leaf, LogOut, RotateCcw, Sparkles } from 'lucide-react';
import { allGenAiAtomicTopics, genAiPairs } from '@/lib/genai';

const progressKey = 'pairwise-genai-v3';

type SavedState = { completed: string[]; pair: number };

async function requireProgressResponse(response: Response) {
  if (response.ok) return;
  if (response.status === 401) throw new Error('Your session has expired. Sign in again to save progress to your account.');
  const result = await response.json().catch(() => null);
  throw new Error(result?.error || `Account progress request failed (${response.status}). Please try again.`);
}

export default function GenAiPage() {
  const { data: session, status: authStatus } = useSession();
  const [completed, setCompleted] = useState<string[]>([]);
  const [pair, setPair] = useState(0);
  const [ready, setReady] = useState(false);
  const [revision, setRevision] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [loadAttempt, setLoadAttempt] = useState(0);
  const saving = useRef(false);
  const generation = useRef(0);

  useEffect(() => {
    let active = true;
    const version = ++generation.current;
    setReady(false);
    setError('');
    if (authStatus === 'loading') return;

    async function load() {
      try {
        let saved: Partial<SavedState> | null = null;
        if (authStatus === 'authenticated') {
          const response = await fetch('/api/progress?module=genai', { cache: 'no-store' });
          await requireProgressResponse(response);
          const result = await response.json();
          if (!active || version !== generation.current) return;
          if (result.progress) {
            saved = result.progress as Partial<SavedState>;
            setSaveStatus('Synced to your account');
          } else {
            saved = JSON.parse(localStorage.getItem(progressKey) || 'null') as Partial<SavedState> | null;
            if (saved) {
              const migration = await fetch('/api/progress', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ module: 'genai', progress: saved }),
              });
              await requireProgressResponse(migration);
              if (!active || version !== generation.current) return;
              setSaveStatus('Synced to your account');
            } else {
              setSaveStatus('No account progress saved yet');
            }
          }
        } else {
          saved = JSON.parse(localStorage.getItem(progressKey) || 'null') as Partial<SavedState> | null;
          setSaveStatus('Saved on this device');
        }

        const validCompleted = Array.isArray(saved?.completed) ? saved.completed.filter(id => allGenAiAtomicTopics.some(topic => topic.id === id)) : [];
        const validPair = Number.isInteger(saved?.pair) && saved!.pair! >= 0 && saved!.pair! < genAiPairs.length ? saved!.pair! : 0;
        if (active) { setCompleted(validCompleted); setPair(validPair); setReady(true); }
      } catch (error) {
        if (active) {
          setSaveStatus('Could not load progress');
          setError(error instanceof Error ? error.message : 'Could not load progress. Please try again.');
        }
      }
    }

    void load();
    return () => { active = false; };
  }, [authStatus, session?.user?.id, loadAttempt]);

  async function save(nextCompleted: string[], nextPair: number) {
    if (!ready || saving.current || authStatus === 'loading') return false;
    saving.current = true;
    setBusy(true);
    setError('');
    setSaveStatus('Saving progress…');
    const version = generation.current;
    const next = { completed: nextCompleted, pair: nextPair } satisfies SavedState;
    try {
      if (authStatus === 'authenticated') {
        const response = await fetch('/api/progress', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ module: 'genai', progress: next }),
        });
        await requireProgressResponse(response);
      } else {
        localStorage.setItem(progressKey, JSON.stringify(next));
      }
      if (version !== generation.current) return false;
      setCompleted(nextCompleted);
      setPair(nextPair);
      setSaveStatus(authStatus === 'authenticated' ? 'Synced to your account' : 'Saved on this device');
      return true;
    } catch (error) {
      if (version === generation.current) {
        setSaveStatus('Progress not saved');
        setError(error instanceof Error ? error.message : 'Progress could not be saved. Please try again.');
      }
      return false;
    } finally {
      saving.current = false;
      setBusy(false);
    }
  }

  function toggle(topicId: string) {
    const next = completed.includes(topicId) ? completed.filter(id => id !== topicId) : [...completed, topicId];
    save(next, pair);
  }

  function move(direction: 1 | -1) {
    const nextPair = Math.max(0, Math.min(genAiPairs.length - 1, pair + direction));
    if (nextPair === pair) return;
    save(completed, nextPair);
  }

  async function handleSignOut() {
    try { localStorage.setItem(progressKey, JSON.stringify({ completed, pair } satisfies SavedState)); } catch { /* Keep the account copy if local storage is unavailable. */ }
    await signOut();
  }

  const current = genAiPairs[pair];
  const pairDone = current?.subtopics.every(topic => completed.includes(topic.id)) ?? false;
  const completedCount = completed.length;
  const totalCount = allGenAiAtomicTopics.length;
  const completion = Math.round((completedCount / totalCount) * 100);

  return <div className="app-shell genai-shell">
    <header className="topbar">
      <a className="brand" href="/" aria-label="Pairwise home"><span className="brand-mark"><span /><span /></span>pairwise<span className="brand-period">.</span></a>
      <div className="header-right"><span className="edition">GEN AI INTERVIEW EDITION</span><span className="status-chip">{ready ? `${completedCount}/${totalCount} complete` : 'Loading'}</span>{session?.user ? <button className="account" onClick={() => void handleSignOut()} disabled={busy} title="Sign out"><span>{session.user.name || session.user.email || 'Signed in'}</span><LogOut size={15}/></button> : <button className="sign-in" onClick={() => void signIn('google')} disabled={authStatus === 'loading'}>Sign in with Google <ArrowUpRight size={15}/></button>}</div>
    </header>
    <main>
      <section className="genai-intro">
        <a className="back-link" href="/"><ArrowLeft size={14}/> Back to interview practice</a>
        <div className="eyebrow"><Sparkles size={13}/> THE GEN AI EDITION</div>
        <h1>Two topics.<br/>A clear <em>next step.</em></h1>
        <p>One focused pair at a time. Study these two atomic topics from wherever you prefer, mark both complete, then unlock the next pair.</p>
        <div className="genai-summary"><div><strong>{completedCount}</strong><span>topics complete</span></div><div><strong>{totalCount - completedCount}</strong><span>still to study</span></div><div><strong>{completion}%</strong><span>roadmap progress</span></div></div>
        <div className="progress-track" role="progressbar" aria-label="GenAI roadmap progress" aria-valuenow={completedCount} aria-valuemin={0} aria-valuemax={totalCount}><span style={{ width: `${completion}%` }}/></div>
        <p className="genai-save-status" role="status">{saveStatus}</p>
        {error && <p className="error" role="alert">{error} {!ready && <button className="text-button" onClick={() => setLoadAttempt(attempt => attempt + 1)}>Retry loading</button>}</p>}
      </section>
      {completedCount === totalCount && !revision ? <section className="welcome-card"><CheckCheck size={36}/><div className="eyebrow">ROADMAP COMPLETE</div><h2>You finished the roadmap.</h2><p>Run through the pairs again and practise explaining each tradeoff out loud.</p><button className="primary" disabled={!ready || busy} onClick={async () => { if (await save(completed, 0)) setRevision(true); }}>Start revision <RotateCcw size={16}/></button></section> : <section className="genai-session" aria-label="Current GenAI study pair">
        <div className="section-heading"><div className="section-label"><span className="tiny-square"/> YOUR NEXT TWO</div><span className="pair-number">PAIR {String(pair + 1).padStart(2, '0')} <span>/ {genAiPairs.length}</span></span></div>
        <article className="practice-card genai-pair-card">
          <div className="card-heading"><div><div className="pair-kicker">{revision ? 'REVISION' : current.topic.track.toUpperCase()}</div><h2>{current.topic.title}<span className="small-period">.</span></h2><p className="genai-parent-note">{current.topic.why}</p></div><span className="pair-number">{pairDone ? 'PAIR COMPLETE' : 'TWO TOPICS'}</span></div>
          <div className="problems">{current.subtopics.map((topic, index) => { const done = completed.includes(topic.id); return <div className={`problem ${done ? 'is-done' : ''}`} key={topic.id}>
            <span className="problem-number">{String(pair * 2 + index + 1).padStart(2, '0')}</span><a className="problem-main genai-topic-link" href={`https://chatgpt.com/?q=${encodeURIComponent(`I am preparing for a GenAI interview. Teach me "${topic.title}" from first principles. Give me the key intuition, one practical example, common interview questions, and the tradeoffs I should be able to explain.`)}`} target="_blank" rel="noopener noreferrer"><h3>{topic.title} <ArrowUpRight size={17}/></h3><p>{topic.focus}</p></a>
            <button className={`done-button ${done ? 'checked' : ''}`} aria-label={`${done ? 'Mark incomplete' : 'Mark complete'}: ${topic.title}`} aria-pressed={done} disabled={!ready || busy} onClick={() => toggle(topic.id)}><span className="checkbox">{done && <Check size={13} strokeWidth={3}/>}</span><span>{done ? 'Complete' : 'Mark done'}</span></button>
          </div>; })}</div>
          <div className="card-footer"><span className={pairDone ? 'pair-complete' : ''}>{pairDone ? <CheckCheck size={16}/> : <Leaf size={16}/>}<span>{pairDone ? 'Nice work. The next pair is unlocked.' : 'Mark both topics done to unlock the next pair.'}</span></span><div className="pair-navigation"><button className="previous" aria-label="Previous GenAI pair" disabled={!ready || busy || pair === 0} onClick={() => move(-1)}><ArrowLeft size={16}/></button><button className="primary" disabled={!ready || busy || !pairDone || pair === genAiPairs.length - 1} onClick={() => move(1)}>Next pair <ArrowRight size={16}/></button></div></div>
        </article>
      </section>}
    </main>
    <footer className="site-footer"><span>Build understanding one pair at a time.</span><a className="text-button" href="/"><ArrowLeft size={14}/> Interview practice</a><span>GEN AI <span className="footer-dot">·</span> TWO TOPICS AT A TIME</span></footer>
  </div>;
}
