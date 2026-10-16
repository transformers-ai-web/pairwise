import Link from 'next/link';
import { ArrowLeft, ArrowRight, Code2, Layers } from 'lucide-react';
import { journeys, type JourneyId } from '@/lib/journeys';
import { filterCards } from '@/lib/collection';

export default function InterviewJourneys() {
  return <div className="app-shell">
    <header className="topbar"><Link className="brand" href="/">pairwise<span className="brand-period">.</span></Link><span className="edition">THE INTERVIEW EDITION</span></header>
    <main>
      <nav className="journey-back"><Link href="/"><ArrowLeft size={14}/> Back to Pairwise</Link><Link href="/genai">The GenAI Edition <ArrowRight size={14}/></Link></nav>
      <section className="intro"><div className="eyebrow"><span className="live-dot"/> FOUNDATIONS + ALL FIVE FAANG JOURNEYS</div><h1>Your next chapter.<br/><em>Choose your path.</em></h1><p>Start with foundations, then choose Meta, Google, Apple, Amazon, or Netflix.<br/>The same quiet rhythm: one card, one small step.</p></section>
      <section className="journey-grid" aria-label="Interview journeys">
        {(Object.keys(journeys) as JourneyId[]).map((id, index) => {
          const journey = journeys[id];
          return <Link className={`journey-card journey-${id}`} href={`/practice/${id}`} key={id}>
            <div className="journey-card-top"><span>{id === 'foundations' ? 'START HERE' : 'FAANG JOURNEY'} · 0{index + 1}</span>{id !== 'foundations' ? <Code2 size={24}/> : <Layers size={24}/>}</div>
            <div className="pair-kicker">{journey.kicker}</div><h2>{journey.title}</h2><p>{journey.description}</p>
            <div className="journey-stats"><span><strong>{filterCards(journey.problems, 'All').length}</strong> cards</span><span><strong>{journey.problems.length}</strong> problems</span></div>
            <div className="journey-card-footer">Explore this journey <ArrowRight size={17}/></div>
          </Link>;
        })}
      </section>
      <p className="journey-reassurance">Your original collection is here, with your saved progress. Each journey keeps its own progress.</p>
      <section className="bottom-note"><span className="note-line"/><span>Less scrolling. More solving.</span><span className="note-line"/></section>
    </main>
    <footer className="site-footer"><span>Built for your next chapter.</span><span>ONE PAIR AT A TIME</span></footer>
  </div>;
}
