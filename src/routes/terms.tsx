import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/PolicyPage";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms of Service — Jaga Traders" }, { name: "description", content: "Terms governing the use of jagatraders.com." }] }),
  component: () => (
    <PolicyPage eyebrow="THE FINE PRINT" title="TERMS OF SERVICE" sections={[
      { h: "Acceptance", p: "By using jagatraders.com you agree to these terms. If you do not agree, please do not use the site." },
      { h: "Account", p: "You are responsible for keeping your account credentials secure. Notify us immediately of any unauthorised access." },
      { h: "Pricing & Availability", p: "Prices are in INR and inclusive of GST unless stated. We reserve the right to correct pricing errors and cancel orders affected by them, with a full refund." },
      { h: "Intellectual Property", p: "All content, logos and product photography belong to Jaga Traders and are protected by Indian and international copyright law." },
      { h: "Limitation of Liability", p: "Jaga Traders is not liable for indirect, incidental or consequential damages arising from product use. Our maximum liability is limited to the order value." },
      { h: "Governing Law", p: "These terms are governed by the laws of India. Disputes shall be subject to the exclusive jurisdiction of the courts at Erode, Tamil Nadu." },
    ]} />
  ),
});