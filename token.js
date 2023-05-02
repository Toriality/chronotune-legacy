const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tokenSchema = new Schema({
  secret: {
    type: String,
    required: [true, "Secret is required"],
    // Make a simple request on Spotify API to check if token is valid
    validate: {
      validator: async function (secret) {
        const response = await fetch(
          `https://api.spotify.com/v1/tracks/2TpxZ7JUBn3uw46aR7qd6V`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${secret}`,
            },
          }
        );

        return response.status === 200;
      },
      message: "Invalid token",
    },
  },
  expireAt: {
    type: Date,
    // Spotify API token expires after 1 hour
    default: Date.now() + 3600 * 1000,
    expires: "1h",
  },
});

tokenSchema.post("save", function () {
  console.log(`Server has saved token ${this.secret}`);
});

const Token = mongoose.model("Token", tokenSchema);
module.exports = Token;
