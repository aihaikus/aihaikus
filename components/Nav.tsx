export default function Nav() {
  return (
    <nav className="sticky top-0 z-50 h-[60px] w-full border-b border-border-subtle bg-bg/70 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-[1400px] items-center justify-between px-6 sm:px-10">
        <a
          href="#top"
          className="font-display text-[15px] font-light tracking-[0.35em] text-text-primary transition-colors duration-300 hover:text-gold"
        >
          AI HAIKUS
        </a>
        <a
          href="https://ordinals.com/inscription/50719"
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[11px] tracking-[0.2em] text-text-secondary transition-colors duration-300 hover:text-gold"
        >
          ordinals <span aria-hidden="true">↗</span>
        </a>
      </div>
    </nav>
  );
}
