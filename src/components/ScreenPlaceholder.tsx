import { fi } from '../i18n/fi';

// Temporary body for screens that later milestones fill in.
export default function ScreenPlaceholder({ title }: { title: string }) {
  return (
    <>
      <h1 className="font-display text-3xl font-semibold">{title}</h1>
      <p className="mt-3 text-muted">{fi.placeholder}</p>
    </>
  );
}
