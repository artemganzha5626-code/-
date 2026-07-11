import type { Badge } from '@/types';

const labels: Record<Badge, { text: string; className: string }> = {
  hit: { text: 'Хіт', className: 'bg-terracotta text-cream' },
  new: { text: 'Новинка', className: 'bg-espresso text-cream' },
};

export function BadgePills({ badges }: { badges: Badge[] }) {
  if (!badges.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map((b) => (
        <span
          key={b}
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${labels[b].className}`}
        >
          {labels[b].text}
        </span>
      ))}
    </div>
  );
}
