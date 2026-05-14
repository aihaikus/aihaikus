export default function Hero() {
  return (
    <section
      id="top"
      className="hero-section relative flex min-h-[calc(100vh-60px)] w-full items-center justify-center overflow-hidden px-6 py-24 sm:px-10"
    >
      {/* radial glow behind title */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(201, 168, 76, 0.05) 0%, rgba(201, 168, 76, 0) 60%)",
        }}
      />

      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center text-center">
        <span className="gold-rule mb-12" aria-hidden="true" />

        <h1 className="font-display font-light tracking-[0.3em] text-text-primary text-[64px] leading-none sm:text-[88px] md:text-[120px]">
          AI HAIKUS
        </h1>

        <div className="mt-10 flex flex-col items-center gap-2 font-mono">
          <p className="text-[11px] uppercase tracking-[0.3em] text-text-secondary sm:text-[13px]">
            50 inscriptions on the Bitcoin blockchain
          </p>
          <p className="text-[11px] uppercase tracking-[0.3em] text-gold sm:text-[13px]">
            February 11th, 2023
          </p>
        </div>

        <span className="gold-rule mt-12" aria-hidden="true" />

        <p className="mt-12 max-w-[600px] font-display text-[18px] font-light leading-relaxed text-text-secondary sm:text-[20px]">
          Preserving the first thoughts of artificial intelligence, sealed
          permanently on Bitcoin at the dawn of the AI era.
        </p>

        <a
          href="#collection"
          className="fade-in-delayed mt-16 inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em] text-text-secondary transition-colors duration-300 hover:text-gold"
        >
          <span>[ explore the collection</span>
          <span aria-hidden="true">↓</span>
          <span>]</span>
        </a>
      </div>
    </section>
  );
}
