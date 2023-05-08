const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const invalidSchema = new Schema(
  {
    year: {
      type: Number,
      required: [true, "Year is required"],
    },
    offset: {
      type: Number,
      required: [true, "Offset is required"],
    },
    word: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

invalidSchema.post("save", function () {
  console.log(`Server has saved invalid query ${this._id}`);
});

const Invalid = mongoose.model("Invalid", invalidSchema);
module.exports = Invalid;
