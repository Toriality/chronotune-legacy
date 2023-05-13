const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reportSchema = new Schema({
  type: {
    type: Number,
    required: [true, "Type is required"],
    enum: {
      values: [0, 1, 2, 3],
      message: "Type is invalid",
    },
  },
  song: {
    type: String,
    required: [true, "Song is required"],
  },
  approved: {
    type: Boolean,
    default: false,
  },
});

reportSchema.post("save", function () {
  console.log(`Server has saved report ${this._id}`);
});

const Report = mongoose.model("Report", reportSchema);
module.exports = Report;
