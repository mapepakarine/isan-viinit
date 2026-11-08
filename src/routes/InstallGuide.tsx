import Section from '../components/Section';
import { fi } from '../i18n/fi';

function Steps({ steps }: { steps: readonly string[] }) {
  return (
    <ol className="flex list-decimal flex-col gap-2 pl-6">
      {steps.map((step) => (
        <li key={step}>{step}</li>
      ))}
    </ol>
  );
}

export default function InstallGuide() {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-display text-3xl font-semibold">{fi.install.title}</h1>
      <p className="text-muted">{fi.install.intro}</p>
      <Section title={fi.install.iphoneTitle}>
        <Steps steps={fi.install.iphoneSteps} />
        <p className="mt-3 font-semibold">{fi.install.iphoneNote}</p>
      </Section>
      <Section title={fi.install.androidTitle}>
        <Steps steps={fi.install.androidSteps} />
      </Section>
    </div>
  );
}
