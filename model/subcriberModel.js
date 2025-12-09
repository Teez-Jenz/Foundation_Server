const mongoose = require("mongoose");

const subscriberSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const subscribers = mongoose.model("Subscriber", subscriberSchema);

module.exports = subscribers;