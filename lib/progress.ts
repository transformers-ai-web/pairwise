import { pairs, problems } from './problems';
export type Progress = { solved: string[]; pair: number };
export const emptyProgress: Progress = { solved: [], pair: 0 };
export function normalizeProgress(value: unknown): Progress {
  if (!value || typeof value !== 'object') return { ...emptyProgress };
  const p = value as Partial<Progress>;
  return { solved: Array.isArray(p.solved) ? [...new Set(p.solved.filter(id => problems.some(x => x.id === id)))] : [], pair: Number.isInteger(p.pair) && p.pair! >= 0 && p.pair! < pairs.length ? p.pair! : 0 };
}
export function nextPair(progress: Progress, direction = 1): number {
  for (let step = 1; step <= pairs.length; step++) {
    const index = (progress.pair + step * direction + pairs.length) % pairs.length;
    if (pairs[index].some(p => !progress.solved.includes(p.id))) return index;
  }
  return progress.pair;
}
