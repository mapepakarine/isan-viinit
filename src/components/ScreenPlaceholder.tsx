import { fi } from '../i18n/fi';

// Temporary body for screens that later milestones fill in.
export default function ScreenPlaceholder({ title }: { title: string }) {
  return (
    <>
      <h1 className="text-3xl font-bold text-wine">{title}</h1>
      <p className="mt-3 text-muted">{fi.placeholder}</p>
    </>
  );
}
