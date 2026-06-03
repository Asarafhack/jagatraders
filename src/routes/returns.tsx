import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/PolicyPage";

export const Route = createFileRoute("/returns")({
  head: () => ({ meta: [{ title: "Returns & Refunds — Jaga Traders" }, { name: "description", content: "30-day return policy and easy refunds at Jaga Traders." }] }),
  component: () => (
    <PolicyPage eyebrow="PEACE OF MIND" title="RETURNS & REFUNDS" sections={[
      { h: "30-Day Returns", p: "Not happy with your purchase? Return it within 30 days of delivery for a full refund or exchange. Item must be unused, in original packaging." },
      { h: "Strung Rackets", p: "Custom-strung rackets are non-returnable once strung, unless there's a manufacturing defect. Inspect before requesting stringing." },
      { h: "Refund Timeline", p: "Refunds are processed within 5–7 business days of receiving the returned item. The amount is credited to your original payment method." },
      { h: "How to Initiate", p: "Email returns@jagatraders.com or message us on WhatsApp with your order number. We'll arrange a free pickup in serviceable PIN codes." },
      { h: "Warranty", p: "All rackets carry a 2-year manufacturer warranty against frame defects. Strings and grips are excluded." },
    ]} />
  ),
});