const express = require("express");
const app = express();

// Configure PROT number
require("dotenv").config();
const PORT = process.env.PORT;

// Configure routes
const routes = require("./routes");
app.use(routes);

// Start server
app.listen(PORT, () => {
  console.log(`Chronotune server app listening on port ${PORT}`);
});
