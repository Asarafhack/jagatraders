import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Jaga Traders" },
      { name: "description", content: "Get in touch with the Jaga Traders team." },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: Contact,
});

function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      <div className="text-xs tracking-widest text-gold">GET IN TOUCH</div>
      <h1 className="font-display text-5xl md:text-7xl mt-2">LET'S TALK GEAR.</h1>

      <div className="grid md:grid-cols-[1fr_1.4fr] gap-12 mt-16">
        <div className="space-y-8">
          {[
          { Icon: MapPin, t: "Visit", d: "Jaga Traders\nBhavani, Erode District,\nTamil Nadu, India 638301" },
            { Icon: Phone, t: "Call / WhatsApp", d: "+91 98765 43210\nMon-Sat, 10am-8pm IST" },
            { Icon: Mail, t: "Email", d: "hello@jagatraders.com\nsupport@jagatraders.com" },
          ].map(({ Icon, t, d }, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-11 h-11 border border-gold/40 flex items-center justify-center text-gold shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <div className="font-display text-xl tracking-widest text-gold">{t.toUpperCase()}</div>
                <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{d}</p>
              </div>
            </div>
          ))}
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); setSent(true); }}
          className="border border-border bg-card p-8 space-y-4"
        >
          <div className="grid md:grid-cols-2 gap-4">
            <input required placeholder="Your name" className="bg-background border border-border px-4 py-3 focus:border-gold outline-none" />
            <input required type="email" placeholder="Email" className="bg-background border border-border px-4 py-3 focus:border-gold outline-none" />
          </div>
          <input placeholder="Subject" className="w-full bg-background border border-border px-4 py-3 focus:border-gold outline-none" />
          <textarea required rows={6} placeholder="How can we help?" className="w-full bg-background border border-border px-4 py-3 focus:border-gold outline-none resize-none" />
          <button className="inline-flex items-center gap-2 bg-gold text-primary-foreground px-6 py-3 font-bold tracking-widest text-sm hover:shadow-gold transition-shadow">
            {sent ? "MESSAGE SENT ✓" : "SEND MESSAGE"} <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      <div className="mt-16 border border-border overflow-hidden">
        <iframe
          title="Jaga Traders — Bhavani"
          src="https://www.google.com/maps?q=Bhavani,+Erode,+Tamil+Nadu&output=embed"
          width="100%"
          height="380"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="block w-full grayscale hover:grayscale-0 transition-all duration-700"
        />
      </div>
    </div>
  );
}