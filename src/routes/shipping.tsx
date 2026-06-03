import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/PolicyPage";

export const Route = createFileRoute("/shipping")({
  head: () => ({ 
    meta: [
      { title: "Shipping Policy — Jaga Traders" }, 
      { name: "description", content: "Shipping rates, delivery times, and tracking for Jaga Traders." }
    ] 
  }),
  component: () => (
    <PolicyPage 
      eyebrow="LOGISTICS" 
      title="SHIPPING POLICY" 
      sections={[
        { 
          h: "Shipping Methods & Timelines", 
          p: "Orders ship within 24 hours from our Bhavani warehouse. We offer two delivery tiers: Surface Shipping (4–7 business days) and Express Air Shipping (1–2 business days for priority fulfillment)." 
        },
        { 
          h: "Shipping Charges", 
          p: "Standard Surface shipping is free on orders above ₹2,999. For orders below this threshold, a flat ₹99 fee applies. Express Air Shipping is calculated at 10% of your total order value to prioritize rapid transit." 
        },
        { 
          h: "Cash on Delivery (COD)", 
          p: "COD is available across India for orders up to ₹15,000. Please ensure someone is available at the delivery address to receive the shipment and complete the cash settlement." 
        },
        { 
          h: "Order Tracking", 
          p: "Once dispatched, you'll receive an email and WhatsApp message with your tracking link. You can also view the status of your shipment directly from your account dashboard." 
        },
        { 
          h: "International Orders", 
          p: "We ship to 40+ countries. International shipping rates are calculated at checkout based on destination and package weight. Customs duties and local taxes are the responsibility of the recipient." 
        },
      ]} 
    />
  ),
});