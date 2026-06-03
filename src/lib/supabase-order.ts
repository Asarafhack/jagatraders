import { supabase } from "@/integrations/supabase/client";

export async function createOrder({
  customerId,
  amount,
  paymentId,
  status,
}: {
  customerId: string;
  amount: number;
  paymentId: string;
  status: string;
}) {
  const { data, error } = await supabase
    .from("orders")
    .insert([
      {
        customer_id: customerId,
        amount,
        payment_id: paymentId,
        status,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  return data;
}