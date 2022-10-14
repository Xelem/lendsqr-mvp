const jwt = require("jsonwebtoken");
const knexConfig = require("../db/knexfile");
const knex = require("knex")(knexConfig[process.env.NODE_ENV]);

exports.protect = async (req, res, next) => {
  // check for token
  let token;
  const { authorization } = req.headers;
  if (authorization) {
    token = authorization.split(" ")[1];
  } else {
    return res.status(401).json({
      status: "fail",
      message: "You are not logged in... Please log in to get access",
    });
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
    return res.status(401).json({
      status: "fail",
      message: "This user does not exist anymore",
    });

  // grant access
  req.user = user[0];
  next();
};
