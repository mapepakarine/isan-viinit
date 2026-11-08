import { fi } from '../i18n/fi';

export default function SummaryCard({ lines }: { lines: string[] }) {
  if (lines.length === 0) return null;
  return (
    <section
      aria-label={fi.home.summaryTitle}
      className="rounded-lg bg-wine p-4 text-white"
    >
      <h2 className="font-bold">{fi.home.summaryTitle}</h2>
      <ul className="mt-1 flex flex-col gap-1">
        {lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </section>
  );
}
