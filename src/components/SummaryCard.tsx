import { fi } from '../i18n/fi';
import { ChevronIcon } from './Icons';

export default function SummaryCard({ lines }: { lines: string[] }) {
  const [headline, ...details] = lines;
  if (!headline) return null;

  const heading = <span className="font-display text-xl leading-snug">{headline}</span>;

  return (
    <section aria-label={fi.home.summaryTitle} className="border-y border-line py-2">
      {details.length === 0 ? (
        <p className="py-2">{heading}</p>
      ) : (
        <details className="group">
          <summary className="flex min-h-11 list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
            {heading}
            <ChevronIcon className="h-6 w-6 shrink-0 text-muted transition-transform group-open:rotate-180" />
          </summary>
          <ul className="mt-1 flex flex-col gap-2 pb-2 text-muted">
            {details.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
