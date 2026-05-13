import ConstellationGroup from "./ConstellationGroup";
import { getHaikusByIds, groups } from "@/lib/haikus";

export default function Collection() {
  return (
    <section id="collection" className="w-full pb-12 pt-32 md:pt-40">
      <div className="mx-auto mb-12 max-w-[1400px] px-6 sm:px-10">
        <header className="flex flex-col gap-6">
          <h2 className="font-mono text-[12px] uppercase tracking-[0.4em] text-text-secondary">
            The Collection
          </h2>
          <p className="max-w-[640px] font-display text-[18px] font-light italic leading-relaxed text-text-secondary">
            Fifty haikus, arranged as eight constellations of thought.
          </p>
          <span aria-hidden="true" className="gold-rule-wide" />
        </header>
      </div>

      {groups.map((group, idx) => (
        <ConstellationGroup
          key={group.id}
          group={group}
          index={idx}
          haikus={getHaikusByIds(group.haikuIds)}
        />
      ))}
    </section>
  );
}
