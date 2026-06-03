import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/PolicyPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy — Jaga Traders" }, { name: "description", content: "How Jaga Traders collects, uses and protects your data." }] }),
  component: () => (
    <PolicyPage eyebrow="YOUR DATA" title="PRIVACY POLICY" sections={[
      { h: "What We Collect", p: "We collect your name, email, phone, shipping address and order history. Payment data is processed by our PCI-DSS compliant gateway — we never store card details." },
      { h: "How We Use It", p: "To fulfil orders, send transactional updates (WhatsApp/email), and improve your experience. With your consent, we may send promotional offers — you can unsubscribe anytime." },
      { h: "Sharing", p: "We share only what's necessary with shipping partners and payment processors. We never sell your data." },
      { h: "Cookies", p: "We use essential cookies for cart and login. Analytics cookies help us understand site usage and are anonymised." },
      { h: "Your Rights", p: "You can request access, correction or deletion of your personal data anytime by writing to privacy@jagatraders.com." },
      { h: "Security", p: "All data is encrypted in transit (TLS 1.3) and at rest. Our infrastructure is hosted on enterprise-grade cloud with regular security audits." },
    ]} />
  ),
});