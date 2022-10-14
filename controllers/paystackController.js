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

exports.verifyPayment = async (req, res) => {
  const status = await paystack.transaction.verify({
    reference: req.params.ref,
  });

  if (status.data.status !== "success") {
    return res.status(400).json({
      status: "fail",
      message: "Transaction was not successful, please try again",
    });
  }

  res.status(200).json({
    status: "success",
    message: `Congratulations! You have successfully credited your Lendsqr wallet with ₦${
      status.data.amount / 100
    }`,
  });
};
