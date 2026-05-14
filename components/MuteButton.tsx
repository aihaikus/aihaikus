"use client";

import { useState } from "react";
import type { CSSProperties, MouseEvent } from "react";
import { audioManager } from "@/lib/audio";

const buttonStyle: CSSProperties = {
  position: "fixed",
  bottom: "24px",
  right: "24px",
  zIndex: 1000,
  background: "rgba(10, 10, 8, 0.8)",
  border: "1px solid rgba(201, 168, 76, 0.3)",
  color: "var(--gold)",
  fontFamily: "var(--font-dm-mono)",
  fontSize: "10px",
  letterSpacing: "0.15em",
  padding: "8px 14px",
  cursor: "pointer",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  transition: "border-color 300ms ease, color 300ms ease",
};

export default function MuteButton() {
  const [muted, setMuted] = useState(false);

  const handleClick = () => {
    const nowMuted = audioManager.toggleMute();
    setMuted(nowMuted);
  };

  const handleMouseEnter = (e: MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.borderColor = "rgba(201, 168, 76, 0.8)";
  };

  const handleMouseLeave = (e: MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.borderColor = "rgba(201, 168, 76, 0.3)";
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label={muted ? "Unmute ambient sound" : "Mute ambient sound"}
      aria-pressed={muted}
      style={buttonStyle}
      className="mute-button"
    >
      {muted ? "♪ UNMUTE" : "♪ MUTE"}
    </button>
  );
}
