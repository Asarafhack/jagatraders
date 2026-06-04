import crypto from "crypto";

export async function POST({ request }: any) {

 const body = await request.json();

 const generated = crypto
 .createHmac(
   "sha256",
   process.env.RAZORPAY_KEY_SECRET!
 )
 .update(
   body.razorpay_order_id +
   "|" +
   body.razorpay_payment_id
 )
 .digest("hex");

 const valid =
 generated === body.razorpay_signature;

 return Response.json({
   success: valid
 });
}