declare global {
  interface Window {
    Razorpay: any;
  }
}

type PaymentResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

interface CartItemPayload {
  product: {
    name: string;
    category: string;
    price: number;
  };
  qty: number;
}

/**
 * Initializes a secure Razorpay checkout transaction layout overlay.
 * Updated to accept an explicit array of cart items to support multi-item invoicing.
 */
export async function startRazorpayPayment(
  amount: number,
  customerName: string,
  customerEmail: string,
  items: CartItemPayload[] = []
) {
  if (!window.Razorpay) {
    throw new Error("Razorpay SDK not loaded. Ensure the script tag is added to index.html.");
  }

  try {
    // Create Razorpay Order via your local payment processing server backend API
    const orderResponse = await fetch(
      "http://localhost:5000/api/payment/create-order",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
        }),
      }
    );

    if (!orderResponse.ok) {
      throw new Error("Failed to create Razorpay order instance through API gateway.");
    }

    const order = await orderResponse.json();

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency || "INR",
      name: "Jaga Traders",
      description: "Badminton Equipment Purchase",
      order_id: order.id,
      prefill: {
        name: customerName,
        email: customerEmail,
      },
      notes: {
        store: "Jaga Traders",
      },
      theme: {
        color: "#D4AF37", // Jaga Traders Signature Court Gold Core Color Accent
      },
      handler: async (response: PaymentResponse) => {
        try {
          // Verify Payment signature token hashes securely
          const verifyResponse = await fetch(
            "http://localhost:5000/api/payment/verify",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(response),
            }
          );

          const verifyResult = await verifyResponse.json();

          if (!verifyResult.success) {
            window.location.href = "/payment-failed";
            return;
          }

          // Persist verified checkout metrics and dynamic item lines to database layers
          const saveOrderResponse = await fetch(
            "http://localhost:5000/api/order/save-order",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                customerName,
                customerEmail,
                amount,
                payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                status: "paid",
                order_status: "pending",
                items, // FIXED: Sending dynamic cart item lines directly to the save-order controller
              }),
            }
          );

          const orderResult = await saveOrderResponse.json();

          if (!orderResult.success) {
            throw new Error("Failed to save completed transaction path inside order history.");
          }

          window.location.href = "/payment-success";
        } catch (error) {
          console.error("Payment verification processing crash:", error);
          window.location.href = "/payment-failed";
        }
      },
      modal: {
        ondismiss: () => {
          console.log("Customer manually closed payment window interface layout.");
        },
      },
    };

    const razorpay = new window.Razorpay(options);

    razorpay.on("payment.failed", (response: any) => {
      console.error("Razorpay Payment Gateway Core Rejection:", response.error);
      window.location.href = "/payment-failed";
    });

    razorpay.open();
  } catch (error) {
    console.error("Payment initialization failed:", error);
    throw error;
  }
}