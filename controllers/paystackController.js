const paystack = require("paystack-api")(process.env.PAYSTACK_SECRET_KEY_DEV);

exports.initializeTransaction = async (req, res) => {
  const session = await paystack.transaction.initialize({
    email: req.user.email,
    amount: req.amount * 100,
  });

  res.status(200).json({
    status: "success",
    session,
  });
};
