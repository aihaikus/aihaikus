import * as Tone from "tone";

const isBrowser = () => typeof window !== "undefined";

// Real recording of Chopin's Nocturne Op. 9 No. 2 (Frank Levy, CC0 / public
// domain, sourced from Musopen via Wikimedia Commons). Loops as the ambient
// bed for the site.
const AMBIENT_TRACK_URL = "/audio/chopin-nocturne-op9-no2.mp3";

// Resting playback level for the ambient bed. The Nocturne is a fully
// mastered recording (peaks near 0 dBFS), so we attenuate generously to
// keep it feeling like background.
const AMBIENT_BASE_DB = -3;
// How far we duck while a haiku is being whispered.
const AMBIENT_DUCK_DB = -30;
// Effective silence when muted.
const AMBIENT_MUTE_DB = -60;

class AudioManager {
  private started = false;
  private muted = false;
  private ambientVolume: Tone.Volume | null = null;
  private ambientPlayer: Tone.Player | null = null;
  private speechSynth: SpeechSynthesisUtterance | null = null;

  async start() {
    if (!isBrowser()) return;
    if (this.started) return;
    await Tone.start();
    this.buildAmbient();
    // Wait for the MP3 to finish decoding before we let `start()` resolve,
    // otherwise the first .start() call on the Player can no-op.
    await Tone.loaded();
    this.ambientPlayer?.start();
    this.started = true;
  }

  async autoStart() {
    if (!isBrowser()) return;
    if (this.started) return;
    try {
      await Tone.start();
      // The browser may "resolve" resume() without the context actually
      // running when the call wasn't from a real user gesture. If we're
      // still suspended, bail so the next listener invocation can retry.
      if (Tone.getContext().state !== "running") return;
      // Second guard for the race where two gesture events resolved in
      // parallel — only the first one builds the graph.
      if (this.started) return;
      this.started = true;
      this.buildAmbient();
      await Tone.loaded();
      this.ambientPlayer?.start();
    } catch (err) {
      if (typeof console !== "undefined") {
        console.warn("[audio] autoStart failed, will retry on next gesture", err);
      }
    }
  }

  private buildAmbient() {
    if (!isBrowser()) return;

    // Master volume node — every ambient-bed change (mute, ducking) is
    // applied here so we never have to touch the Player directly.
    this.ambientVolume = new Tone.Volume(AMBIENT_BASE_DB).toDestination();

    // Real piano recording — has natural room acoustics already, so we
    // route it straight into the master volume instead of through an
    // extra reverb (which would just muddy the recorded ambience).
    this.ambientPlayer = new Tone.Player({
      url: AMBIENT_TRACK_URL,
      loop: true,
      autostart: false,
      // The MP3 has the usual encoder-induced silence at head/tail.
      // Nudging the loop window in by ~50 ms on each side avoids a
      // gap at the loop boundary.
      loopStart: 0.05,
      fadeIn: 0.8,
      fadeOut: 0.8,
    }).connect(this.ambientVolume);
  }

  async playFlipAccent() {
    if (!isBrowser()) return;
    if (this.muted || !this.started) return;
    await Tone.start();

    const accentReverb = new Tone.Reverb({ decay: 3, wet: 0.6 }).toDestination();
    const accent = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.01, decay: 0.5, sustain: 0, release: 2 },
      volume: -20,
    }).connect(accentReverb);

    accent.triggerAttackRelease("G4", "8n");

    // Dispose after the tail has finished so we don't leak nodes per flip.
    setTimeout(() => {
      accent.dispose();
      accentReverb.dispose();
    }, 4000);
  }

  whisperHaiku(text: string, haikuId: number) {
    if (!isBrowser()) return;
    if (this.muted) return;
    if (!("speechSynthesis" in window)) return;

    // Hovering a new card interrupts whatever is currently being whispered.
    window.speechSynthesis.cancel();

    if (this.ambientVolume) {
      this.ambientVolume.volume.rampTo(AMBIENT_DUCK_DB, 0.5);
    }

    // 12 distinct voice characters — each haiku id maps to one of these
    // deterministically so the same poem always sounds the same.
    const characters = [
      { rate: 0.82, pitch: 0.6, volume: 0.85 },  // deep old man
      { rate: 1.1, pitch: 1.8, volume: 0.95 },   // young excited woman
      { rate: 0.65, pitch: 0.75, volume: 0.8 },  // slow mysterious
      { rate: 1.2, pitch: 1.2, volume: 1.0 },    // bright cheerful
      { rate: 0.75, pitch: 1.5, volume: 0.85 },  // soft high whisper
      { rate: 0.9, pitch: 0.5, volume: 0.95 },   // very deep serious
      { rate: 1.15, pitch: 1.0, volume: 1.0 },   // neutral confident
      { rate: 0.7, pitch: 1.7, volume: 0.8 },    // dreamy high
      { rate: 1.3, pitch: 0.8, volume: 1.0 },    // fast low urgency
      { rate: 0.8, pitch: 1.3, volume: 0.85 },   // gentle medium
      { rate: 1.05, pitch: 0.65, volume: 0.9 },  // gravelly older
      { rate: 0.95, pitch: 1.6, volume: 0.9 },   // light airy
    ];

    const character = characters[haikuId % characters.length];

    const utterance = new SpeechSynthesisUtterance();

    // Tiny pause between lines — just a comma's worth, not a sentence break.
    const formatted = text.split("\n").join(", ");
    utterance.text = formatted;

    utterance.rate = character.rate;
    utterance.pitch = character.pitch;
    utterance.volume = character.volume;

    // Prefer local (offline) English voices — network voices like
    // "Google …" can silently fail when their endpoint is unavailable.
    const voices = window.speechSynthesis.getVoices();
    const englishLocal = voices.filter(
      (v) => v.lang.startsWith("en") && v.localService,
    );
    const englishAny = voices.filter((v) => v.lang.startsWith("en"));
    const pool = englishLocal.length > 0 ? englishLocal : englishAny;

    if (pool.length > 0) {
      // Stride of 7 keeps voice and character indexes from always co-varying.
      const voiceIndex = (haikuId * 7) % pool.length;
      utterance.voice = pool[voiceIndex];
    }

    const restoreAmbient = (ramp: number) => {
      // If a newer whisper has already taken over, don't un-duck — the
      // newer one is about to (or already has) re-ducked the ambient bed.
      if (this.speechSynth !== utterance) return;
      if (!this.ambientVolume) return;
      this.ambientVolume.volume.rampTo(AMBIENT_BASE_DB, ramp);
    };

    utterance.onend = () => restoreAmbient(1.5);
    utterance.onerror = () => restoreAmbient(0.5);

    // Claim ownership *before* speaking so any previously-cancelled
    // utterance's late onend can see it has been superseded.
    this.speechSynth = utterance;

    // Chrome occasionally drops a speak() that happens in the same tick as
    // cancel(); a tiny delay sidesteps that race.
    setTimeout(() => {
      if (this.muted) return;
      if (this.speechSynth !== utterance) return;
      window.speechSynthesis.speak(utterance);
    }, 50);
  }

  toggleMute() {
    if (!isBrowser()) return this.muted;
    this.muted = !this.muted;
    if (this.muted) {
      window.speechSynthesis?.cancel();
      if (this.ambientVolume) {
        this.ambientVolume.volume.rampTo(AMBIENT_MUTE_DB, 0.5);
      }
    } else {
      if (this.ambientVolume) {
        this.ambientVolume.volume.rampTo(AMBIENT_BASE_DB, 0.5);
      }
    }
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }
  isStarted() {
    return this.started;
  }
}

export const audioManager = new AudioManager();
