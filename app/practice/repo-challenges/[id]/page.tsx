import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getRepoChallenge } from '@/lib/repo-challenges-db';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Repo Challenge | Pairwise' };

export default async function RepoChallengePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const challenge = await getRepoChallenge(id);
  if (!challenge) notFound();

  return <>
    <section className="repo-intro">
      <Link className="back-link" href="/practice/repo-challenges"><ArrowLeft size={14} /> Back to repo challenges</Link>
      <h1 className="repo-title">{challenge.title}</h1>
      <div className="tags"><span className={`difficulty ${challenge.difficulty.toLowerCase()}`}>{challenge.difficulty}</span><span>{challenge.duration_minutes} minutes</span></div>
      <ul className="repo-skills" aria-label="Skills">{challenge.skills.map(skill => <li key={skill}>{skill}</li>)}</ul>
    </section>
    <article className="practice-card repo-card repo-detail">
      <h2>Problem statement</h2>
      <p className="repo-statement">{challenge.description}</p>
      <h2>Repository</h2>
      <p className="repo-url">{challenge.repo_url}</p>
      <p>Base commit: <code>{challenge.base_commit}</code></p>
      <button className="primary" disabled aria-describedby="environment-status">Launch Coding Environment</button>
      <p id="environment-status">Coding environments are coming later. The sample repository and base commit are placeholders.</p>
    </article>
  </>;
}
