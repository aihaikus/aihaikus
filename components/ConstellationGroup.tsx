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

function getOffset(id: number) {
  return {
    translateX: ((id * 37) % 40) - 20,
    translateY: ((id * 23) % 30) - 15,
    rotate: ((id * 13) % 10) - 5,
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

type ConstellationCardProps = {
  haiku: Haiku;
  cardIndex: number;
  isMobile: boolean;
};

function ConstellationCard({
  haiku,
  cardIndex,
  isMobile,
}: ConstellationCardProps) {
  const [hovered, setHovered] = useState(false);

  const offset = getOffset(haiku.id);

  const restTransform = isMobile
    ? "translate(0px, 0px) rotate(0deg)"
    : `translate(${offset.translateX}px, ${offset.translateY}px) rotate(${offset.rotate}deg)`;

  const hoverTransform = "translate(0px, 0px) rotate(0deg) scale(1.04)";

  const useHover = !isMobile && hovered;

  const wrapperStyle: CSSProperties = {
    transform: useHover ? hoverTransform : restTransform,
    transition: "transform 400ms ease",
    zIndex: useHover ? 10 : 1,
    position: "relative",
    willChange: "transform",
  };

  return (
    <div
      style={wrapperStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <HaikuCard haiku={haiku} index={cardIndex} />
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
          className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-4"
          style={{ overflow: "visible" }}
        >
          {haikus.map((haiku) => (
            <ConstellationCard
              key={haiku.id}
              haiku={haiku}
              cardIndex={index * 10 + haiku.id}
              isMobile={isMobile}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
