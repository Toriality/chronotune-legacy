const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const songFactSchema = new Schema({
  songId: {
    type: String,
    required: [true, "Song ID is required"],
    maxLength: [1000, "Song ID is too long"],
  },
  fact: {
    type: String,
    required: [true, "Fact is required"],
    minLength: [100, "Fact is too short"],
    maxLength: [5000, "Fact is too long"],
  },
  image: {
    type: String,
    maxLength: [1000, "Image URL is too long"],
  },
  approved: {
    type: Boolean,
    default: false,
  },
});

songFactSchema.post("save", function () {
  console.log(`Server has saved song fact ${this._id}`);
});

const SongFact = mongoose.model("SongFact", songFactSchema);
module.exports = SongFact;
