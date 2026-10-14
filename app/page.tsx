'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, ArrowLeft, Check, Code2, Sparkles, Leaf, BookOpen, ChevronDown } from 'lucide-react';
import styles from './landing.module.css';

const steps = [
  { title: 'Meet your next pair.', text: 'Open interview practice and start with two related problems. A focused starting point, so you spend your energy learning.', label: '01 / FIND YOUR FOCUS', first: 'Two Sum', second: 'Group Anagrams', topic: 'Arrays & hashing' },
  { title: 'Solve. Connect the dots.', text: 'Follow the problem links to LeetCode or GFG. Work through each one, notice the shared pattern, then mark it done in Pairwise.', label: '02 / BUILD UNDERSTANDING', first: 'Valid Palindrome', second: '3Sum', topic: 'Two pointers' },
  { title: 'Make progress that stays.', text: 'Finish both problems to unlock the next pair. Progress saves in your browser; sign in with Google to sync it to your account. Revisit any pair from the collection.', label: '03 / KEEP SHOWING UP', first: 'Valid Parentheses', second: 'Evaluate Reverse Polish Notation', topic: 'Stacks' },
];

export default function Landing() {
  const [step, setStep] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const hero = root.current?.querySelector<HTMLElement>(`.${styles.hero}`);
    if (!hero) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let heroTop = 0;
    let mobile = false;
    const update = () => {
      frame = 0;
      const distance = preference.matches ? 0 : Math.max(0, Math.min(window.scrollY - heroTop, 600));
      const strength = mobile ? 0.4 : 1;
      hero.style.setProperty('--photo-scroll', `${distance * 0.08 * strength}px`);
      hero.style.setProperty('--card-scroll', `${distance * -0.045 * strength}px`);
      hero.style.setProperty('--frame-scroll', `${distance * 0.025 * strength}px`);
    };
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(update); };
    const measure = () => {
      heroTop = hero.getBoundingClientRect().top + window.scrollY;
      mobile = window.innerWidth <= 700;
      schedule();
    };
    measure();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', measure);
    preference.addEventListener('change', schedule);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', measure);
      preference.removeEventListener('change', schedule);
      hero.style.removeProperty('--photo-scroll');
      hero.style.removeProperty('--card-scroll');
      hero.style.removeProperty('--frame-scroll');
    };
  }, []);
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const animations = new Set<Animation>();
    if (!root.current || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        if (preference.matches) return;
        entry.target.querySelectorAll<HTMLElement>(`.${styles.facts} > div, .${styles.edition}, .${styles.momentum} > span`).forEach((item, index) => {
          const reveal = item.animate([
            { opacity: 0, transform: 'translateY(18px) scale(.97)' },
            { opacity: 1, transform: 'translateY(0) scale(1)' },
          ], { duration: 650, delay: 100 + index * 120, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' });
          animations.add(reveal);
          reveal.onfinish = () => animations.delete(reveal);
        });
        entry.target.querySelectorAll<HTMLElement>(`.${styles.momentum} > i`).forEach((line, index) => {
          const flow = line.animate([
            { transform: 'scaleX(0)', background: '#546f40' },
            { transform: 'scaleX(1)', background: '#bdcaaa' },
          ], { duration: 900, delay: 350 + index * 400, easing: 'ease-out', fill: 'backwards' });
          animations.add(flow);
          flow.onfinish = () => animations.delete(flow);
        });
        const animation = entry.target.animate([
          { opacity: 0, transform: 'translateY(22px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ], { duration: 650, easing: 'cubic-bezier(.2,.7,.2,1)' });
        animations.add(animation);
        animation.onfinish = () => animations.delete(animation);
      });
    }, { threshold: 0.12 });
    root.current.querySelectorAll('main > section:not(:first-child)').forEach(section => observer.observe(section));
    const stopMotion = () => { if (preference.matches) animations.forEach(animation => animation.cancel()); };
    preference.addEventListener('change', stopMotion);
    return () => {
      observer.disconnect();
      animations.forEach(animation => animation.cancel());
      preference.removeEventListener('change', stopMotion);
    };
  }, []);
  const current = steps[step];
  return <div className={styles.landing} ref={root}>
    <a href="#main" className={styles.skip}>Skip to content</a>
    <header className={styles.nav}>
      <Link href="/" className={styles.logo} aria-label="Pairwise home"><span className={styles.mark}><i/><i/></span>pairwise<span>.</span></Link>
      <nav aria-label="Main navigation"><a href="#why">The idea</a><a href="#how">How it works</a><a href="#explore">Explore</a></nav>
      <Link className={styles.navCta} href="/practice">Start practicing <ArrowUpRight size={16}/></Link>
    </header>
    <main id="main">
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <div className={styles.eyebrow}><span/> A LITTLE EVERY DAY. A LOT OF POSSIBILITY.</div>
          <h1>Big ambitions.<br/>Small steps.<br/><em>Better together.</em></h1>
          <p>Meet Pairwise. Your quiet corner for interview prep.<br className={styles.desktopBreak}/> Two problems at a time. One clearer path forward.</p>
          <div className={styles.heroActions}><Link className={styles.button} href="/practice">Find your first pair <ArrowUpRight size={18}/></Link><a className={styles.watch} href="#how">See how it works <ArrowRight size={16}/></a></div>
          <div className={styles.micro}><Check size={14}/> No sign-up needed <span>·</span> Start at your own pace</div>
        </div>
        <div className={styles.heroVisual} onPointerMove={event => {
          if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
          const bounds = event.currentTarget.getBoundingClientRect();
          event.currentTarget.style.setProperty('--lean-x', `${((event.clientX - bounds.left) / bounds.width - .5) * 5}deg`);
          event.currentTarget.style.setProperty('--lean-y', `${((event.clientY - bounds.top) / bounds.height - .5) * -5}deg`);
        }} onPointerLeave={event => {
          event.currentTarget.style.setProperty('--lean-x', '0deg');
          event.currentTarget.style.setProperty('--lean-y', '0deg');
        }}>
          <img className={styles.heroPhoto} src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1100&q=85" alt="People collaborating around a laptop at a shared table" width="1100" height="900" fetchPriority="high"/>
          <div className={styles.photoTag}><span/> YOUR NEXT CHAPTER STARTS SMALL</div>
          <div className={styles.floatingCard}><div className={styles.cardTop}><span>TODAY’S LITTLE WIN</span><Leaf size={17}/></div><h3>One pair. A step forward.</h3><div><span className={styles.check}><Check size={13}/></span> Two Sum <small>Arrays & hashing</small></div><div><span className={styles.check}><Check size={13}/></span> Group Anagrams <small>Arrays & hashing</small></div><footer><span>Small effort. Real momentum.</span><span>2 / 2 <Check size={12}/></span></footer></div>
          <div className={styles.sideNote}>a little progress, every day ↗</div>
        </div>
      </section>
      <section className={styles.facts} aria-label="What is inside Pairwise"><div><strong>2</strong><span>problems at a time</span></div><div><strong>16</strong><span>thoughtful practice pairs</span></div><div><strong>32</strong><span>interview problems</span></div><div><Leaf size={28}/><span>one sustainable habit</span></div></section>
      <section className={styles.idea} id="why"><div><div className={styles.eyebrow}>LESS OVERWHELM. MORE FORWARD.</div><h2>The next big thing<br/>starts with <em>two small things.</em></h2></div><div><p>Too many tabs. Too many lists. Too much “where do I even start?” We’ve been there.</p><p>Pairwise brings interview preparation back to what matters: focused practice. Related problems help you spot patterns, build understanding, and turn a daunting goal into a step you can take today.</p><a href="#how">Less deciding. More doing. <ArrowRight size={17}/></a></div></section>
      <section className={styles.walkthrough} id="how" aria-label="Product walkthrough"><div className={styles.sectionHeading}><div><div className={styles.eyebrow}>A SIMPLE RHYTHM. A STRONGER YOU.</div><h2>Find your flow.</h2></div><span>From “where do I start?” to “what’s next?”</span></div><div className={styles.walkGrid}><div className={styles.stepCopy} aria-live="polite"><span className={styles.stepLabel}>{current.label}</span><h3>{current.title}</h3><p>{current.text}</p><div className={styles.controls}><button aria-label="Previous step" onClick={() => setStep((step + 2) % 3)}><ArrowLeft size={18}/></button><div className={styles.dots}>{steps.map((item, i) => <button key={item.title} aria-label={`Show step ${i + 1}: ${item.title}`} aria-pressed={step === i} onClick={() => setStep(i)} className={step === i ? styles.activeDot : ''}/>)}</div><button aria-label="Next step" onClick={() => setStep((step + 1) % 3)}><ArrowRight size={18}/></button></div></div><div className={styles.demo} key={step}><div className={styles.demoToolbar}><span className={styles.logo}><span className={styles.mark}><i/><i/></span>pairwise.</span><span>PRODUCT PREVIEW</span></div><div className={styles.demoHeading}><div><small>YOUR NEXT SMALL STEP</small><h3>{current.topic}</h3></div><span>PAIR {String(step + 1).padStart(2, '0')} / 16</span></div>{[current.first, current.second].map((name, i) => <div className={styles.demoProblem} key={name}><span>0{step * 2 + i + 1}</span><div><small>{i === 0 ? 'Easy' : 'Medium'} <span>· {current.topic}</span></small><h4>{name}</h4><span className={styles.demoLink}>Open problem <ArrowUpRight size={12}/></span></div><span className={styles.demoCheckbox}>{step === 2 && <Check size={14}/>}</span></div>)}<div className={styles.demoBottom}><Leaf size={14}/><span>{step === 2 ? 'A little practice. A lot of progress.' : 'Two problems. One focused session.'}</span><Link href="/practice">Try it <ArrowRight size={13}/></Link></div></div></div></section>
      <section className={styles.explore} id="explore"><div className={styles.sectionHeading}><div><div className={styles.eyebrow}>CHOOSE YOUR NEXT CHAPTER</div><h2>Different goals.<br/><em>The same small steps.</em></h2></div><p>Build your foundations.<br/>Then expand what’s possible.</p></div><div className={styles.editions}><Link href="/practice" className={styles.edition}><div className={styles.editionImage}><img src="https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=80" width="900" height="560" alt="Code on a laptop screen" loading="lazy"/><span><Code2 size={16}/> THE INTERVIEW EDITION</span></div><div className={styles.editionBody}><h3>Build your problem-solving muscle.<ArrowUpRight size={25}/></h3><p>From arrays to dynamic programming. Practice related problems, recognize patterns, and keep track of every step.</p><span>Explore interview practice <ArrowRight size={16}/></span></div></Link><Link href="/genai" className={styles.edition}><div className={`${styles.editionImage} ${styles.aiImage}`}><img src="https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=900&q=80" width="900" height="560" alt="Flowing abstract colors suggesting connected ideas" loading="lazy"/><span><Sparkles size={16}/> THE GENAI EDITION</span></div><div className={styles.editionBody}><h3>Get curious. Get AI-ready.<ArrowUpRight size={25}/></h3><p>A guided roadmap from foundations to RAG, agents, and system design. Build understanding one topic pair at a time.</p><span>Explore the GenAI roadmap <ArrowRight size={16}/></span></div></Link></div></section>
      <section className={styles.motto}><div className={styles.momentum} aria-label="Practice, connect, progress"><span><Code2 size={18}/>Practice</span><i aria-hidden="true"/><span><BookOpen size={18}/>Connect</span><i aria-hidden="true"/><span><Leaf size={18}/>Progress</span></div><div className={styles.eyebrow}>THE IDEA WE KEEP COMING BACK TO</div><h2>You don’t need to do it all today.<br/><em>Just a little. Then a little more.</em></h2><p>We believe confidence is built, one small promise to yourself at a time.<br/>Pairwise exists to make that promise easier to keep.</p><Link className={styles.button} href="/practice">Take your first small step <ArrowUpRight size={18}/></Link><span>Two problems. A fresh start. Your pace.</span></section>
      <section className={styles.faq}><div><BookOpen size={23}/><h2>A few things<br/>you might wonder.</h2></div><div>{[{q:'Do I need an account to get started?',a:'No. Start practicing right away and your progress is saved in this browser. Sign in with Google inside the practice dashboard to save progress to your account.'},{q:'Where do I solve the problems?',a:'Each interview problem links to LeetCode or GeeksforGeeks. Solve it there, then return to Pairwise to mark it done. External platforms may have their own account requirements.'},{q:'Can I go back and revise?',a:'Yes. Open the collection in interview practice to return to any pair, including completed ones. You can also undo a done mark and revisit the full bank after completion.'}].map(item => <details key={item.q}><summary>{item.q}<ChevronDown size={17}/></summary><p>{item.a}</p></details>)}</div></section>
    </main>
    <footer className={styles.footer}><Link href="/" className={styles.logo}><span className={styles.mark}><i/><i/></span>pairwise.</Link><span>A little practice. A lot of progress.</span><a href="#main">Back to the top <ArrowUpRight size={14}/></a></footer>
  </div>;
}
