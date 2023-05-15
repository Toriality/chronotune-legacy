const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const titleImageSchema = new Schema({
  year: {
    type: Number,
    required: [true, "Year is required"],
  },
  images: {
    type: [String],
    required: [true, "Images are required"],
  },
  expireAt: { type: Date, expires: "1d", default: Date.now() + 86400000 },
});

titleImageSchema.post("save", function () {
  console.log(`Server has saved title image variant ${this._id}`);
});

const TitleImage = mongoose.model("TitleImage", titleImageSchema);
module.exports = TitleImage;
