const knexConfig = require("../db/knexfile");
const knex = require("knex")(knexConfig[process.env.NODE_ENV]);

exports.create_account = (req, res) => {
  const { firstName, lastName, userName, email, password } = req.body;

  if (!firstName || !lastName || !userName || !email || !password) {
    res.status(400).json({
      status: "fail",
      message: "Please input all necessary fields",
    });
  }

  knex("users")
    .insert({
      first_name: firstName,
      last_name: lastName,
      username: userName,
      email,
      password,
    })
    .then((id) => {
      //get user by id
      knex("users")
        .select({
          id: "id",
          username: "username",
        })
        .where({ id })
        .then((user) => {
          return res.json(user[0]);
        });
    });
};
