import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Jaga Traders" },
      { name: "description", content: "Built by players, for players. The story of Jaga Traders." },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: About,
});

function About() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-xs tracking-widest text-gold">OUR STORY</div>
        <h1 className="font-display text-5xl md:text-7xl mt-2 leading-[0.95]">
          BUILT BY <span className="text-gradient-gold">PLAYERS</span>,<br />
          FOR PLAYERS.
        </h1>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-10 mt-16">
        <p className="text-lg text-foreground/80 leading-relaxed">
          Jaga Traders was founded in 2015 by a circle of national-level shuttlers who couldn't find gear that
          matched their intensity. We started by stringing rackets for friends in a garage in Hyderabad and
          grew into one of India's most trusted badminton specialists.
        </p>
        <p className="text-lg text-foreground/80 leading-relaxed">
          Today we curate equipment from the world's most exacting manufacturers and test every product
          against tournament conditions before it reaches your bag. No filler. No fluff. Just gear that
          wins points.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 border-y border-border py-10">
        {[
          { n: "2015", l: "Founded" },
          { n: "50K+", l: "Players Served" },
          { n: "12", l: "Countries Shipped" },
          { n: "4.9★", l: "Average Rating" },
        ].map((s, i) => (
          <div key={i}>
            <div className="font-display text-4xl md:text-5xl text-gold">{s.n}</div>
            <div className="text-xs tracking-widest text-muted-foreground mt-2">{s.l.toUpperCase()}</div>
          </div>
        ))}
      </div>

      <div className="mt-20">
        <h2 className="font-display text-3xl md:text-4xl">OUR PROMISE</h2>
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          {[
            { t: "AUTHENTIC", d: "Every product is sourced directly from authorised distributors. No fakes, no greys." },
            { t: "TESTED", d: "Our team of pros and coaches stress-test every racket, shoe, and shuttle." },
            { t: "BACKED", d: "30-day returns and a two-year warranty on every racket. No questions." },
          ].map((c, i) => (
            <div key={i} className="border border-border p-6 bg-card">
              <div className="font-display text-2xl tracking-widest text-gold">{c.t}</div>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{c.d}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}