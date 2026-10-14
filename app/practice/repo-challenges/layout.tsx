import Link from 'next/link';

export default function RepoChallengesLayout({ children }: { children: React.ReactNode }) {
  return <div className="app-shell repo-shell">
    <header className="topbar">
      <Link className="brand" href="/" aria-label="Pairwise home"><span className="brand-mark"><span /><span /></span>pairwise<span className="brand-period">.</span></Link>
      <span className="edition">REPO CHALLENGES</span>
    </header>
    <main>{children}</main>
    <footer className="site-footer"><span>Pairwise. A little practice. A lot of progress.</span></footer>
  </div>;
}
