"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

import HaikuCard from "./HaikuCard";
import type { Group, Haiku } from "@/lib/haikus";

type ConstellationGroupProps = {
  group: Group;
  index: number;
  haikus: Haiku[];
};

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"] as const;

function toRoman(n: number): string {
  return ROMAN[n - 1] ?? String(n);
}

// Desktop-only splatter offsets per card.
//
// Worst-case clearance math (two adjacent cards translating toward each other):
//   horizontal: gap-24 (96 px) − 2·24 = 48 px ≈ 1.27 cm  ✓
//   vertical:   gap-24 (96 px) − 2·18 = 60 px ≈ 1.6  cm  ✓
//   1 cm ≈ 38 px at the conventional 96 dpi, so both axes clear the bar.
//
// At xl breakpoint the gap grows to gap-32 (128 px) giving even more room.
//
// Deterministic per haiku id (using coprime moduli) so the same card always
// lands in the same spot — no hydration mismatch, no reflow on remount.
function getOffset(id: number) {
  return {
    translateX: ((id * 37) % 49) - 24,
    translateY: ((id * 23) % 37) - 18,
    rotate: ((id * 13) % 17) - 8,
  };
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  return isMobile;
}

/** Desktop 3-column grid: center orphan row (1 or 2 cards). */
function desktopLastRowClass(index: number, total: number): string | undefined {
  const r = total % 3;
  if (r === 0) return undefined;
  const isLast = index === total - 1;
  if (r === 1 && isLast) return "md:col-start-2";
  if (r === 2 && isLast) return "md:col-start-3";
  return undefined;
}

type ConstellationCardProps = {
  haiku: Haiku;
  cardIndex: number;
  isMobile: boolean;
  className?: string;
};

function ConstellationCard({
  haiku,
  cardIndex,
  isMobile,
  className,
}: ConstellationCardProps) {
  const [hovered, setHovered] = useState(false);

  const offset = getOffset(haiku.id);

  const restTransform = isMobile
    ? "translate(0px, 0px) rotate(0deg)"
    : `translate(${offset.translateX}px, ${offset.translateY}px) rotate(${offset.rotate}deg)`;

  const hoverTransform = "translate(0px, 0px) rotate(0deg) scale(1.04)";

  const useHover = !isMobile && hovered;

  const innerStyle: CSSProperties = {
    transform: useHover ? hoverTransform : restTransform,
    transition: "transform 400ms ease",
    zIndex: useHover ? 10 : 1,
    position: "relative",
    willChange: "transform",
  };

  return (
    <div
      className={[
        className,
        "constellation-card-cell min-w-0 overflow-visible",
        /* Padding lives on a NON-rotated shell so rotated art never fights
           the grid row box — lots of room for ±8° + translate splatter. */
        "md:px-5 md:pt-28 md:pb-32",
      ]
        .filter(Boolean)
        .join(" ")}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={() => setHovered(false)}
    >
      <div style={innerStyle}>
        <HaikuCard haiku={haiku} index={cardIndex} />
      </div>
    </div>
  );
}

export default function ConstellationGroup({
  group,
  index,
  haikus,
}: ConstellationGroupProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("visible");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const isEven = group.id % 2 === 0;
  const sectionStyle: CSSProperties = {
    background: isEven ? "rgba(201, 168, 76, 0.02)" : "transparent",
    overflow: "visible",
  };

  return (
    <section
      ref={sectionRef}
      className="constellation-group w-full px-6 py-[60px] sm:px-10"
      style={sectionStyle}
      aria-labelledby={`group-${group.id}-title`}
    >
      <div className="mx-auto max-w-[1400px]" style={{ overflow: "visible" }}>
        <header className="mb-12">
          <div className="flex items-center gap-4">
            <span aria-hidden="true" className="block h-6 w-[2px] bg-gold" />
            <span className="font-mono text-[11px] tracking-[0.3em] text-text-dim">
              {toRoman(group.id)}
            </span>
          </div>

          <h3
            id={`group-${group.id}-title`}
            className="mt-4 font-display text-[28px] font-light tracking-[0.2em] text-text-primary sm:text-[32px]"
          >
            {group.title}
          </h3>
          <p className="mt-2 font-mono text-[12px] italic text-text-secondary">
            {group.subtitle}
          </p>

          <span
            aria-hidden="true"
            className="mt-6 block h-px w-full bg-border-gold"
          />
        </header>

        <div
          className="constellation-grid grid grid-cols-2 items-start gap-x-8 gap-y-12 overflow-visible md:grid-cols-3 md:gap-x-24 md:gap-y-40 xl:gap-x-32 xl:gap-y-48"
          style={{ overflow: "visible" }}
        >
          {haikus.map((haiku, i) => (
            <ConstellationCard
              key={haiku.id}
              haiku={haiku}
              cardIndex={index * 10 + haiku.id}
              isMobile={isMobile}
              className={desktopLastRowClass(i, haikus.length)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
