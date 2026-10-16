import { problems, type Problem } from './problems';
import { filterCards } from './collection';
import { legacyCompanyBanks, initialReportedBanks } from './reported-problems';
export type Progress = { solved: string[]; pair: number; cardLayout?: 'difficulty-v1' | 'evidence-v1' | 'evidence-v2' };
export const emptyProgress: Progress = { solved: [], pair: 0 };
export function normalizeProgress(value: unknown, bank: readonly Problem[] = problems): Progress {
  const p = (value && typeof value === 'object' ? value : {}) as Partial<Progress>;
  const cards = filterCards(bank, 'All');
  const company = bank[0]?.evidence?.company;
  if (company) {
    const legacy = legacyCompanyBanks[company];
    const known = new Set([...legacy, ...bank].map(problem => problem.id));
    // Keep removed completions so a source audit never destroys user history.
    const solved = Array.isArray(p.solved) ? [...new Set(p.solved.filter(id => known.has(id)))] : [];
    let pair = Number.isInteger(p.pair) && p.pair! >= 0 && p.pair! < cards.length ? p.pair! : 0;
    if (p.cardLayout !== 'evidence-v2' && Number.isInteger(p.pair)) {
      const oldIndex = Number.isInteger(p.pair) && p.pair! >= 0 ? p.pair! : 0;
      const anchors = p.cardLayout === 'evidence-v1' ? filterCards(initialReportedBanks[company], 'All')[oldIndex]?.problems ?? [] : p.cardLayout === 'difficulty-v1' ? filterCards(legacy, 'All')[oldIndex]?.problems ?? [] : legacy.slice(oldIndex * 2, oldIndex * 2 + 2);
      pair = cards.findIndex(card => card.problems.some(problem => anchors.some(anchor => anchor.id === problem.id)));
      if (pair < 0) pair = Math.max(0, cards.findIndex(card => card.problems.some(problem => !solved.includes(problem.id))));
    }
    return { solved, pair, cardLayout: 'evidence-v2' };
  }
  let pair = Number.isInteger(p.pair) && p.pair! >= 0 && p.pair! < cards.length ? p.pair! : 0;
  if (p.cardLayout !== 'difficulty-v1') {
    // Old card indices refer to the original adjacent pairs. Follow the first
    // problem on that card into the new layout; solved IDs remain unchanged.
    const anchor = Number.isInteger(p.pair) && p.pair! >= 0 ? bank[p.pair! * 2] : undefined;
    pair = anchor ? cards.findIndex(card => card.problems.some(problem => problem.id === anchor.id)) : 0;
  }
  return { solved: Array.isArray(p.solved) ? [...new Set(p.solved.filter(id => bank.some(x => x.id === id)))] : [], pair, cardLayout: 'difficulty-v1' };
}
export function nextPair(progress: Progress, direction: 1 | -1 = 1, bank: readonly Problem[] = problems): number {
  const pairs = filterCards(bank, 'All').map(card => card.problems);
  if (direction === 1 && !pairs[progress.pair].every(p => progress.solved.includes(p.id))) return progress.pair;
  return Math.max(0, Math.min(pairs.length - 1, progress.pair + direction));
}
