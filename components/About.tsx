export default function About() {
  return (
    <section className="w-full px-6 py-32 sm:px-10 md:py-40">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-16 md:grid-cols-12 md:gap-20">
        <div className="md:col-span-5">
          <blockquote className="font-display text-[28px] font-light italic leading-[1.35] text-text-primary sm:text-[34px] md:text-[40px]">
            “Preserving the thoughts of AI in its nascent days — immutably,
            forever.”
          </blockquote>
        </div>

        <div className="md:col-span-7 md:border-l md:border-border-gold md:pl-12 lg:pl-16">
          <div className="space-y-6 font-mono text-[13px] font-light leading-[1.9] text-text-secondary">
            <p>
              In February 2023, two technologies were simultaneously shocking
              the world.
            </p>
            <p>
              ChatGPT had launched three months earlier — the first artificial
              intelligence available to everyone. Ordinals had launched weeks
              earlier — a new protocol allowing data to be inscribed
              permanently on the Bitcoin blockchain.
            </p>
            <p>
              On February 11th, 2023,{" "}
              <span className="text-text-primary">@888mooncat</span> sat at the
              intersection of both and asked: what does early AI think about
              itself, about humanity, about Bitcoin, about freedom?
            </p>
            <p>
              The answers — 50 of them, selected from a longer conversation —
              were inscribed on Bitcoin that same day. Inscription numbers{" "}
              <span className="text-gold">50,719</span> through{" "}
              <span className="text-gold">53,706</span>.
            </p>
            <p>
              They cannot be altered. They cannot be deleted. As long as
              Bitcoin exists, these words exist.
            </p>
            <p className="text-text-primary">
              This is what AI thought, in its earliest days.
              <br />
              This is the record.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
