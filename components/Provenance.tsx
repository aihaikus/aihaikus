import type { ReactNode } from "react";

type Row = {
  label: string;
  value: ReactNode;
  gold?: boolean;
};

type CreditRow = {
  label: string;
  value: ReactNode;
};

const rows: Row[] = [
  { label: "Protocol", value: "Bitcoin Ordinals" },
  { label: "Blockchain", value: "Bitcoin" },
  {
    label: "Creator",
    value: (
      <a
        href="https://x.com/888mooncat"
        target="_blank"
        rel="noopener noreferrer"
        className="transition-colors duration-300 hover:text-gold"
      >
        @888mooncat
      </a>
    ),
  },
  { label: "Date Inscribed", value: "February 11th, 2023" },
  { label: "Collection Size", value: "50 of 50 (complete)" },
  { label: "Inscription Range", value: "#50,719 — #53,706" },
  { label: "Content Type", value: "text/plain" },
  {
    label: "Status",
    value: "Permanent. Immutable. Verified on-chain.",
    gold: true,
  },
];

const creditRows: CreditRow[] = [
  {
    label: "Note",
    value:
      "888mooncat used 50 pieces of Glicpixxxs ver002 nft collection on Ethereum as visual element under 888mooncat's collector rights",
  },
];

export default function Provenance() {
  return (
    <section className="w-full px-6 py-32 sm:px-10 md:py-40">
      <div className="mx-auto max-w-[900px]">
        <header className="mb-16 flex flex-col gap-6">
          <h2 className="font-mono text-[12px] uppercase tracking-[0.4em] text-text-secondary">
            Provenance
          </h2>
          <span aria-hidden="true" className="gold-rule-wide" />
        </header>

        <dl className="flex flex-col">
          {rows.map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-1 gap-2 border-b border-border-subtle py-5 sm:grid-cols-12 sm:items-baseline sm:gap-6"
            >
              <dt className="font-mono text-[11px] uppercase tracking-[0.25em] text-text-dim sm:col-span-4">
                {row.label}
              </dt>
              <dd
                className={`font-mono text-[13px] tracking-[0.05em] sm:col-span-8 ${
                  row.gold ? "text-gold" : "text-text-primary"
                }`}
              >
                {row.value}
              </dd>
            </div>
          ))}

          <div
            aria-hidden="true"
            className="my-3 h-px w-full bg-border-gold"
          />

          {creditRows.map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-1 gap-2 border-b border-border-subtle py-5 sm:grid-cols-12 sm:items-baseline sm:gap-6"
            >
              <dt className="font-mono text-[11px] uppercase tracking-[0.25em] text-text-dim sm:col-span-4">
                {row.label}
              </dt>
              <dd className="font-mono text-[13px] tracking-[0.05em] text-text-primary sm:col-span-8">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-12 max-w-[600px] font-mono text-[12px] font-light leading-[1.9] text-text-secondary">
          Each inscription can be independently verified on the Bitcoin
          blockchain. The content of these haikus cannot be altered, deleted,
          or disputed. They exist as long as Bitcoin exists.
        </p>

        <a
          href="https://ordinals.com/inscription/50719"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-12 inline-flex items-center gap-3 border border-border-gold px-6 py-4 font-mono text-[11px] uppercase tracking-[0.3em] text-text-primary transition-colors duration-300 hover:border-gold hover:text-gold"
        >
          <span>Verify on ordinals.com</span>
          <span aria-hidden="true">↗</span>
        </a>
      </div>
    </section>
  );
}
