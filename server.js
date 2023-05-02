require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();

// Configure PROT number
const PORT = process.env.PORT;

// Configure mongoose
const URI = process.env.DATABASE_URI;
mongoose.set("strictQuery", false);
mongoose.connect(URI).then(
  () => {
    console.log("Connected to database");
  },
  (err) => {
    console.log(err);
  }
);

// Configure routes
const routes = require("./routes");
app.use(routes);

// Start server
app.listen(PORT, () => {
  console.log(`Chronotune server app listening on port ${PORT}`);
});
