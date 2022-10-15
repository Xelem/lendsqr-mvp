const dotenv = require("dotenv");
const knexConfig = require("./db/knexfile");

dotenv.config({ path: "./config.env" });
const app = require("./app");

const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

const knex = require("knex")(knexConfig[process.env.NODE_ENV]);
knex.raw("SELECT VERSION()").then(() => {
  console.log("DB connection successful");
});

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.error("Unhandled Rejection!!! Shutting Down...💥");
  server.close(() => {
    process.exit(1);
  });
});
