"use client";

import { useEffect } from "react";
import { audioManager } from "@/lib/audio";

// Events the browser counts as a user activation (so AudioContext.resume()
// will succeed). mousemove / scroll / touchmove are NOT user activations and
// can't unlock audio on their own, but we still listen so we can attempt an
// optimistic start if the page is already unlocked from a prior interaction.
const GESTURE_EVENTS = [
  "click",
  "mousedown",
  "pointerdown",
  "touchstart",
  "touchend",
  "keydown",
] as const;

const OPTIMISTIC_EVENTS = ["scroll", "mousemove", "touchmove"] as const;

const ALL_EVENTS = [...GESTURE_EVENTS, ...OPTIMISTIC_EVENTS] as const;

export default function AudioInit() {
  useEffect(() => {
    let disposed = false;

    const detach = () => {
      for (const name of ALL_EVENTS) {
        window.removeEventListener(name, handler);
      }
    };

    const handler = async () => {
      if (disposed) return;
      if (audioManager.isStarted()) {
        detach();
        return;
      }
      await audioManager.autoStart();
      if (audioManager.isStarted()) detach();
    };

    for (const name of ALL_EVENTS) {
      window.addEventListener(name, handler, { passive: true });
    }

    // Try once immediately in case the AudioContext is already unlocked
    // (e.g. SPA navigation back to this page after the user already clicked).
    void audioManager.autoStart();

    return () => {
      disposed = true;
      detach();
    };
  }, []);

  return null;
}
