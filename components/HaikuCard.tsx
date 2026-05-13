"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import type { Haiku } from "@/lib/haikus";
import { audioManager } from "@/lib/audio";

type HaikuCardProps = {
  haiku: Haiku;
  index: number;
};

const FRONT_BORDER = "rgba(201, 168, 76, 0.4)";
const BACK_BORDER = "rgba(201, 168, 76, 0.8)";

export default function HaikuCard({ haiku, index }: HaikuCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice(
      "ontouchstart" in window || navigator.maxTouchPoints > 0,
    );
  }, []);

  const number = String(haiku.id).padStart(2, "0");
  const inscriptionLabel = haiku.inscription.toLocaleString("en-US");
  const ordinalsHref = `https://ordinals.com/inscription/${haiku.inscription}`;

  const handleCardClick = () => {
    if (isTouchDevice) {
      const nextFlipped = !isFlipped;
      setIsFlipped(nextFlipped);
      if (nextFlipped) {
        void audioManager.playFlipAccent();
        audioManager.whisperHaiku(haiku.text, haiku.id);
      }
      // Flipping back does NOT cancel the whisper — let it finish for cacophony.
    } else {
      window.open(ordinalsHref, "_blank", "noopener,noreferrer");
    }
  };

  // Desktop hover/focus enqueues another whisper on top of whatever's playing.
  // Touch devices also synthesise mouseenter/focus on tap, so guard those out.
  const handleMouseEnter = () => {
    if (isTouchDevice) return;
    void audioManager.playFlipAccent();
    audioManager.whisperHaiku(haiku.text, haiku.id);
  };

  const handleFocus = () => {
    if (isTouchDevice) return;
    void audioManager.playFlipAccent();
    audioManager.whisperHaiku(haiku.text, haiku.id);
  };

  // On desktop, CSS :hover / :focus-within handles the flip transform.
  // On touch devices, we drive the transform inline from React state.
  const flipperStyle: CSSProperties = isTouchDevice
    ? { transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }
    : {};

  return (
    <div
      role={isTouchDevice ? "button" : "link"}
      aria-pressed={isTouchDevice ? isFlipped : undefined}
      aria-label={
        isTouchDevice
          ? `Haiku ${number}. Tap to flip.`
          : `Haiku ${number}. Hover to read; click to open inscription ${inscriptionLabel} on ordinals.com.`
      }
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onFocus={handleFocus}
      className="haiku-card flip-card relative h-[300px] w-full cursor-pointer md:h-[320px]"
      style={{ animationDelay: `${index * 0.03}s` }}
    >
      <div className="flipper" style={flipperStyle}>
        {/* Front face — original artwork */}
        <div
          className="flip-face"
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            border: `1px solid ${FRONT_BORDER}`,
            background: "#0a0a08",
            overflow: "hidden",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/haiku-images/HAIKU${haiku.id}.jpg`}
            alt={`Haiku ${number} — original inscription artwork`}
            loading="lazy"
            decoding="async"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              zIndex: 0,
            }}
          />

          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
              background:
                "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.7) 100%)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{ position: "relative", zIndex: 2 }}
            className="flex h-full flex-col justify-end p-5"
          >
            <span className="font-mono text-[10px] tracking-[0.2em] text-gold drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]">
              #{inscriptionLabel}
            </span>
          </div>
        </div>

        {/* Back face — clean poem */}
        <div
          className="flip-face flip-back"
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            border: `1px solid ${BACK_BORDER}`,
            background: "#0a0a08",
          }}
        >
          <div className="flex h-full flex-col p-7">
            <span className="font-mono text-[11px] tracking-[0.2em] text-text-dim">
              {number}
            </span>

            <div className="flex flex-1 items-center justify-center py-4">
              <p
                className="whitespace-pre-line text-center font-display text-[18px] font-light italic text-text-primary"
                style={{ lineHeight: 1.8 }}
              >
                {haiku.text}
              </p>
            </div>

            <div className="flex flex-col items-start gap-3">
              <span
                aria-hidden="true"
                className="block h-px w-14 bg-gold-dim"
              />
              <span className="font-mono text-[10px] tracking-[0.2em] text-text-secondary">
                inscription #{inscriptionLabel}
              </span>
              <a
                href={ordinalsHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="font-mono text-[10px] tracking-[0.2em] text-gold transition-colors duration-300 hover:text-text-primary"
              >
                view on ordinals <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
