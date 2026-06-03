import { supabase } from "@/integrations/supabase/client";

export async function savePayment({
  orderId,
  paymentId,
  amount,
}: {
  orderId: string;
  paymentId: string;
  amount: number;
}) {
  const { error } = await supabase
    .from("payments")
    .insert([
      {
        order_id: orderId,
        payment_id: paymentId,
        amount,
        status: "paid",
      },
    ]);

  if (error) throw error;
}