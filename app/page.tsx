import About from "@/components/About";
import ClaudeAnalysis from "@/components/ClaudeAnalysis";
import Collection from "@/components/Collection";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Nav from "@/components/Nav";
import Provenance from "@/components/Provenance";
import StatsBar from "@/components/StatsBar";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="relative z-10 flex flex-col">
        <Hero />
        <About />
        <StatsBar />
        <Collection />
        <Provenance />
        <ClaudeAnalysis />
      </main>
      <Footer />
    </>
  );
}
