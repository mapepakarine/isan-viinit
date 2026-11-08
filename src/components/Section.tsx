import type { ReactNode } from 'react';

export default function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-line pt-4">
      <h2 className="mb-2 font-display text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}
