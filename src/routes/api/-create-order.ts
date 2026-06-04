import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST({ request }: any) {
  const body = await request.json();

  const order = await razorpay.orders.create({
    amount: body.amount * 100,
    currency: "INR",
    receipt: `order_${Date.now()}`
  });

  return Response.json(order);
}