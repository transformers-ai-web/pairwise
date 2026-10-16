import type { Problem } from '@/lib/problems';
import type { Progress } from '@/lib/progress';
import { filterCards } from '@/lib/collection';

export default function Collection({ problems, progress, disabled, onPair }: {
  problems: readonly Problem[];
  progress: Progress;
  disabled: boolean;
  onPair: (index: number) => void;
}) {
  return <div className="collection-list">{filterCards(problems, 'All').map(({ problems: pair, index }) => <button key={index} disabled={disabled} onClick={() => onPair(index)}>
    <span>{String(index + 1).padStart(2, '0')}</span><div><strong>{[...new Set(pair.map(p => p.topic))].join(' / ')}</strong><small>{pair.map(p => p.title).join(' · ')}</small><small>{pair.map(p => p.difficulty).join(' + ')}{pair.some(p => p.premium) ? ' · Includes Premium' : ''}</small></div><span>{pair.filter(p => progress.solved.includes(p.id)).length}/{pair.length}</span>
  </button>)}</div>;
}
