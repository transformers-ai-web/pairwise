import type { Problem } from './problems';

export const difficulties = ['All', 'Easy', 'Medium', 'Hard'] as const;
export type DifficultyFilter = typeof difficulties[number];
export function filterCards(problems: readonly Problem[], difficulty: DifficultyFilter) {
  const groups = difficulties.slice(1).map(level => problems.filter(problem => problem.difficulty === level));
  return groups.flatMap(group => Array.from({ length: Math.ceil(group.length / 2) }, (_, index) => group.slice(index * 2, index * 2 + 2)))
    .map((pair, index) => ({ index, problems: pair }))
    .filter(card => difficulty === 'All' || card.problems.some(problem => problem.difficulty === difficulty));
}
