const jwt = require("jsonwebtoken");
const knexConfig = require("../db/knexfile");
const AppError = require("../utilities/appError");
const knex = require("knex")(knexConfig[process.env.NODE_ENV]);
const catchAsync = require("../utilities/catchAsync");

exports.protect = catchAsync(async (req, res, next) => {
  // check for token
  let token;
  const { authorization } = req.headers;
  if (authorization) {
    token = authorization.split(" ")[1];
  } else {
    return next(
      new AppError("You are not logged in... Please log in to get access", 401)
    );
  }

  // verify token
  const decoded = await jwt.verify(token, process.env.JWT_SECRET);

  // check if user still exists
  const user = await knex("users")
    .select({
      id: "id",
      username: "username",
      email: "email",
    })
    .where({ id: decoded.id });

  if (!user[0])
    return next(new AppError("This user does not exist anymore", 401));

  // grant access
  req.user = user[0];
  next();
});
