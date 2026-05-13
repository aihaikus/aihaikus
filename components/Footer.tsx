export default function Footer() {
  return (
    <footer className="w-full border-t border-border-subtle px-6 py-20 sm:px-10">
      <div className="mx-auto flex max-w-[900px] flex-col items-center text-center font-mono">
        <p className="text-[12px] tracking-[0.4em] text-text-primary">
          AI HAIKUS
        </p>
        <p className="mt-4 text-[11px] tracking-[0.2em] text-text-secondary">
          50 inscriptions on the Bitcoin blockchain
        </p>
        <p className="mt-1 text-[11px] tracking-[0.2em] text-text-secondary">
          February 11th, 2023
        </p>

        <div className="mt-12 flex w-full max-w-[500px] flex-col items-center justify-between gap-4 text-[11px] tracking-[0.2em] sm:flex-row">
          <a
            href="https://x.com/888mooncat"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-dim transition-colors duration-300 hover:text-gold"
          >
            @888mooncat
          </a>
          <a
            href="https://ordinals.com/inscription/50719"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-dim transition-colors duration-300 hover:text-gold"
          >
            ordinals.com <span aria-hidden="true">↗</span>
          </a>
        </div>

        <span
          aria-hidden="true"
          className="mt-12 block h-px w-full max-w-[500px] bg-border-subtle"
        />

        <p className="mt-12 text-[11px] tracking-[0.2em] text-text-dim">
          Permanently inscribed on Bitcoin.{" "}
          <span className="text-gold">Forever.</span>
        </p>
      </div>
    </footer>
  );
}
