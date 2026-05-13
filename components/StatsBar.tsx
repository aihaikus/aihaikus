type Stat = {
  value: string;
  label: string;
};

const stats: Stat[] = [
  { value: "50 INSCRIPTIONS", label: "Complete Collection" },
  { value: "#50,719 – #53,706", label: "Inscription Range" },
  { value: "11 FEB 2023", label: "Date Sealed" },
];

export default function StatsBar() {
  return (
    <section className="w-full border-y border-border-subtle bg-bg-elevated px-6 py-16 sm:px-10">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-12 text-center sm:grid-cols-3 sm:gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col items-center gap-4 font-mono"
          >
            <span className="text-[14px] tracking-[0.25em] text-gold sm:text-[15px]">
              {stat.value}
            </span>
            <span
              aria-hidden="true"
              className="block h-px w-16 bg-gold-dim"
            />
            <span className="text-[10px] uppercase tracking-[0.3em] text-text-dim">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
