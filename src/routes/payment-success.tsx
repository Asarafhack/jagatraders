import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/payment-success")({
  component: PaymentSuccess,
});

function PaymentSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-green-600">
          Payment Successful
        </h1>

        <p className="mt-4">
          Thank you for shopping with Jaga Traders.
        </p>
      </div>
    </div>
  );
}