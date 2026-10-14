import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { listRepoChallenges } from '@/lib/repo-challenges-db';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Repo Challenges | Pairwise' };

export default async function RepoChallengesPage() {
  const challenges = await listRepoChallenges();
  return <>
    <section className="repo-intro">
      <Link className="back-link" href="/"><ArrowLeft size={14} /> Back to interview practice</Link>
      <h1>Repo <em>Challenges.</em></h1>
      <p>Practice focused engineering problems in a code repository.</p>
    </section>
    <section className="repo-grid" aria-label="Available repo challenges">
      {challenges.map(challenge => <article className="practice-card repo-card" key={challenge.id}>
        <div className="tags"><span className={`difficulty ${challenge.difficulty.toLowerCase()}`}>{challenge.difficulty}</span><span>{challenge.duration_minutes} minutes</span></div>
        <h2>{challenge.title}</h2>
        <p>{challenge.description}</p>
        <ul className="repo-skills" aria-label="Skills">{challenge.skills.map(skill => <li key={skill}>{skill}</li>)}</ul>
        <Link className="primary" href={`/practice/repo-challenges/${challenge.id}`} aria-label={`Start Challenge: ${challenge.title}`}>Start Challenge <ArrowRight size={14} /></Link>
      </article>)}
      {challenges.length === 0 && <p>No repo challenges are available yet.</p>}
    </section>
  </>;
}
