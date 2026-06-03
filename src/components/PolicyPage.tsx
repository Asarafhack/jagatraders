import { motion } from "framer-motion";

export function PolicyPage({ eyebrow, title, sections }: { eyebrow: string; title: string; sections: { h: string; p: string }[] }) {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-xs tracking-widest text-gold">{eyebrow}</div>
        <h1 className="font-display text-5xl md:text-6xl mt-2">{title}</h1>
        <div className="h-px w-24 bg-gold mt-6" />
        <p className="text-xs tracking-widest text-muted-foreground mt-6">
          Last updated: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      </motion.div>

      <div className="mt-12 space-y-10">
        {sections.map((s, i) => (
          <motion.section
            key={s.h}
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
          >
            <h2 className="font-display text-2xl tracking-wider text-gold">{s.h.toUpperCase()}</h2>
            <p className="mt-3 text-foreground/80 leading-relaxed">{s.p}</p>
          </motion.section>
        ))}
      </div>
    </div>
  );
}