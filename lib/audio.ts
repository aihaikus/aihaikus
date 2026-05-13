import * as Tone from "tone";

const isBrowser = () => typeof window !== "undefined";

type MelodyEvent = { note: string; dur: string };
type BassEvent = { notes: string[]; dur: string };

class AudioManager {
  private started = false;
  private muted = false;
  private ambientVolume: Tone.Volume | null = null;
  private reverb: Tone.Reverb | null = null;
  private delay: Tone.FeedbackDelay | null = null;
  private speechSynth: SpeechSynthesisUtterance | null = null;

  async start() {
    if (!isBrowser()) return;
    if (this.started) return;
    await Tone.start();
    this.buildAmbient();
    // Reverb IR is generated asynchronously — wait so the first chord
    // doesn't land dry into a not-yet-rendered convolver buffer.
    await Tone.loaded();
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
    } catch (err) {
      if (typeof console !== "undefined") {
        console.warn("[audio] autoStart failed, will retry on next gesture", err);
      }
    }
  }

  private buildAmbient() {
    if (!isBrowser()) return;

    // Master volume.
    this.ambientVolume = new Tone.Volume(-12).toDestination();

    // Salon / chamber reverb — short, dry, classical clarity.
    this.reverb = new Tone.Reverb({
      decay: 1.8,
      wet: 0.25,
    }).connect(this.ambientVolume);

    // === RIGHT HAND — singing melody voice (fortepiano-ish triangle) ===
    const melodySynth = new Tone.Synth({
      oscillator: { type: "triangle" },
      envelope: { attack: 0.02, decay: 0.4, sustain: 0.3, release: 0.8 },
      volume: -18,
    }).connect(this.reverb);

    // === LEFT HAND — Alberti bass (rounder sine, plays chords) ===
    const bassSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "sine" },
      envelope: { attack: 0.02, decay: 0.3, sustain: 0.2, release: 0.6 },
      volume: -24,
    }).connect(this.reverb);

    // Tempo and meter must be set BEFORE we resolve any Tone.Time values
    // below, because Time conversions read the transport's current BPM.
    Tone.getTransport().bpm.value = 96;
    Tone.getTransport().timeSignature = 3;

    // === MELODY ===
    // 16 bars (two 8-bar phrases) of a Mozart-flavoured C-major theme.
    // Each entry is [note, duration].
    const melodyPhraseA: Array<[string, string]> = [
      // Bar 1 — opening gesture, ascending
      ["E4", "4n"], ["G4", "4n"], ["C5", "4n"],
      // Bar 2 — step down
      ["B4", "4n"], ["A4", "4n"], ["G4", "4n"],
      // Bar 3 — ornamental turn
      ["A4", "8n"], ["G4", "8n"], ["A4", "4n"], ["F4", "4n"],
      // Bar 4 — cadence approaching
      ["G4", "2n"], ["E4", "4n"],
      // Bar 5 — repeat with variation, higher
      ["G4", "4n"], ["C5", "4n"], ["E5", "4n"],
      // Bar 6 — singing descent
      ["D5", "4n"], ["C5", "4n"], ["B4", "4n"],
      // Bar 7 — tension building
      ["C5", "4n"], ["B4", "4n"], ["A4", "4n"],
      // Bar 8 — perfect cadence landing on tonic
      ["G4", "2n"], ["C4", "4n"],
    ];

    const melodyPhraseB: Array<[string, string]> = [
      // Bar 9 — contrasting phrase, starts on dominant
      ["G4", "4n"], ["B4", "4n"], ["D5", "4n"],
      // Bar 10
      ["C5", "4n"], ["B4", "4n"], ["A4", "4n"],
      // Bar 11 — minor inflection (A minor)
      ["A4", "4n"], ["C5", "4n"], ["E5", "4n"],
      // Bar 12
      ["D5", "4n"], ["C5", "4n"], ["B4", "4n"],
      // Bar 13 — return to C major feeling
      ["C5", "8n"], ["D5", "8n"], ["E5", "4n"], ["C5", "4n"],
      // Bar 14
      ["D5", "4n"], ["B4", "4n"], ["G4", "4n"],
      // Bar 15 — penultimate bar, building to final cadence
      ["A4", "4n"], ["F4", "4n"], ["G4", "4n"],
      // Bar 16 — final resolution
      ["C5", "2n"], ["C4", "4n"],
    ];

    const fullMelody: Array<[string, string]> = [
      ...melodyPhraseA,
      ...melodyPhraseB,
    ];

    let melodyTime = 0;
    const melodyEvents: Array<[number, MelodyEvent]> = [];
    for (const [note, dur] of fullMelody) {
      melodyEvents.push([melodyTime, { note, dur }]);
      melodyTime += Tone.Time(dur).toSeconds();
    }

    const melodyPart = new Tone.Part<[number, MelodyEvent]>((time, value) => {
      if (this.muted) return;
      melodySynth.triggerAttackRelease(value.note, value.dur, time);
    }, melodyEvents);
    melodyPart.loop = true;
    melodyPart.loopEnd = melodyTime;
    melodyPart.start(0);

    // === ALBERTI BASS ===
    // Pattern over each bar: 6 eighth notes alternating root + (5th+3rd).
    // Bar harmonies match the melody's implied chord changes.
    const bassPattern: string[][][] = [
      // Phrase A
      // Bar 1 — C major
      [["C3"], ["G3", "E3"], ["C3"], ["G3", "E3"], ["C3"], ["G3", "E3"]],
      // Bar 2 — G major
      [["G2"], ["D3", "B2"], ["G2"], ["D3", "B2"], ["G2"], ["D3", "B2"]],
      // Bar 3 — F major
      [["F2"], ["C3", "A2"], ["F2"], ["C3", "A2"], ["F2"], ["C3", "A2"]],
      // Bar 4 — G major
      [["G2"], ["D3", "B2"], ["G2"], ["D3", "B2"], ["G2"], ["D3", "B2"]],
      // Bar 5 — C major
      [["C3"], ["G3", "E3"], ["C3"], ["G3", "E3"], ["C3"], ["G3", "E3"]],
      // Bar 6 — G major
      [["G2"], ["D3", "B2"], ["G2"], ["D3", "B2"], ["G2"], ["D3", "B2"]],
      // Bar 7 — A minor
      [["A2"], ["E3", "C3"], ["A2"], ["E3", "C3"], ["A2"], ["E3", "C3"]],
      // Bar 8 — C major (cadence)
      [["C3"], ["G3", "E3"], ["C3"], ["G3", "E3"], ["C3"], ["G3", "E3"]],
      // Phrase B
      // Bar 9 — G major
      [["G2"], ["D3", "B2"], ["G2"], ["D3", "B2"], ["G2"], ["D3", "B2"]],
      // Bar 10 — C major
      [["C3"], ["G3", "E3"], ["C3"], ["G3", "E3"], ["C3"], ["G3", "E3"]],
      // Bar 11 — A minor
      [["A2"], ["E3", "C3"], ["A2"], ["E3", "C3"], ["A2"], ["E3", "C3"]],
      // Bar 12 — G major
      [["G2"], ["D3", "B2"], ["G2"], ["D3", "B2"], ["G2"], ["D3", "B2"]],
      // Bar 13 — C major
      [["C3"], ["G3", "E3"], ["C3"], ["G3", "E3"], ["C3"], ["G3", "E3"]],
      // Bar 14 — G major
      [["G2"], ["D3", "B2"], ["G2"], ["D3", "B2"], ["G2"], ["D3", "B2"]],
      // Bar 15 — F major
      [["F2"], ["C3", "A2"], ["F2"], ["C3", "A2"], ["F2"], ["C3", "A2"]],
      // Bar 16 — C major (resolution)
      [["C3"], ["G3", "E3"], ["C3"], ["G3", "E3"], ["C3"], ["G3", "E3"]],
    ];

    const barDuration = Tone.Time("2n.").toSeconds();
    const eighthDuration = Tone.Time("8n").toSeconds();
    const totalBassTime = bassPattern.length * barDuration;

    const bassEvents: Array<[number, BassEvent]> = [];
    bassPattern.forEach((bar, barIndex) => {
      const barStart = barIndex * barDuration;
      bar.forEach((noteSet, eighthIndex) => {
        bassEvents.push([
          barStart + eighthIndex * eighthDuration,
          { notes: noteSet, dur: "8n" },
        ]);
      });
    });

    const bassPart = new Tone.Part<[number, BassEvent]>((time, value) => {
      if (this.muted) return;
      bassSynth.triggerAttackRelease(value.notes, value.dur, time);
    }, bassEvents);
    bassPart.loop = true;
    bassPart.loopEnd = totalBassTime;
    bassPart.start(0);

    // === GRACE NOTES — quick ornaments before two melodic peaks ===
    const graceEvents: Array<[number, MelodyEvent]> = [
      [Tone.Time("4m").toSeconds() - 0.08, { note: "D5", dur: "32n" }],
      [Tone.Time("12m").toSeconds() - 0.08, { note: "D5", dur: "32n" }],
    ];

    const gracePart = new Tone.Part<[number, MelodyEvent]>((time, value) => {
      if (this.muted) return;
      melodySynth.triggerAttackRelease(value.note, value.dur, time);
    }, graceEvents);
    gracePart.loop = true;
    gracePart.loopEnd = melodyTime;
    gracePart.start(0);

    Tone.getTransport().start();
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
      this.ambientVolume.volume.rampTo(-24, 0.5);
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
      this.ambientVolume.volume.rampTo(-10, ramp);
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
        this.ambientVolume.volume.rampTo(-60, 0.5);
      }
    } else {
      if (this.ambientVolume) {
        this.ambientVolume.volume.rampTo(-10, 0.5);
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
