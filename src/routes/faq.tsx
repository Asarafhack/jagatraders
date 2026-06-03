import { createFileRoute } from "@tanstack/react-router";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Jaga Traders" },
      { name: "description", content: "Answers to common questions about orders, shipping, and gear." },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
  }),
  component: FAQ,
});

const faqs = [
  { q: "Are your rackets authentic?", a: "Yes. Every product is sourced directly from authorised distributors and ships with manufacturer warranty cards." },
  { q: "How long does shipping take?", a: "Metro orders arrive in 2-3 business days. Pan-India 3-6 days. International orders ship within 24 hours and arrive in 5-12 business days." },
  { q: "What's your return policy?", a: "30 days, no questions. Unused products in original packaging are eligible for a full refund or exchange." },
  { q: "Do you offer racket stringing?", a: "Yes. In-store stringing in Hyderabad with 24-hour turnaround. Mail-in stringing available across India for ₹399 + string cost." },
  { q: "Do you ship internationally?", a: "We currently ship to 12 countries including the US, UK, UAE, Singapore, Australia, and the EU." },
  { q: "What payment methods do you accept?", a: "All major credit/debit cards, UPI, net banking, wallets, and cash on delivery (eligible PIN codes only)." },
  { q: "How do I track my order?", a: "You'll receive a tracking link by SMS and email as soon as your order ships. You can also track from your account dashboard." },
  { q: "Do you have a warranty?", a: "Two-year manufacturer warranty on all rackets and footwear. Accessories carry a 90-day defect warranty." },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <div className="text-xs tracking-widest text-gold">HELP CENTRE</div>
      <h1 className="font-display text-5xl md:text-6xl mt-2">QUESTIONS?</h1>
      <p className="text-muted-foreground mt-4">Answers to the most common things players ask us.</p>

      <div className="mt-12 divide-y divide-border border-y border-border">
        {faqs.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={i}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center justify-between gap-4 py-5 text-left group"
              >
                <span className="font-display text-lg md:text-xl tracking-wide group-hover:text-gold transition-colors">{f.q}</span>
                <span className="text-gold shrink-0">{isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}</span>
              </button>
              {isOpen && <div className="pb-6 text-muted-foreground leading-relaxed">{f.a}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}