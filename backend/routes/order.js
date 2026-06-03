const express = require("express");
const router = express.Router();
const supabase = require("../lib/supabase");

router.post("/save-order", async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      amount,
      payment_id,
      razorpay_order_id,
    } = req.body;

    const { data: customer } = await supabase
      .from("customers")
      .insert({
        name: customerName,
        email: customerEmail,
      })
      .select()
      .single();

    const { data: order } = await supabase
      .from("orders")
      .insert({
        customer_id: customer.id,
        amount,
        payment_id,
        razorpay_order_id,
        status: "paid",
        order_status: "pending",
      })
      .select()
      .single();

    await supabase.from("payments").insert({
      order_id: order.id,
      payment_id,
      amount,
      status: "paid",
      payment_method: "razorpay",
    });

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;