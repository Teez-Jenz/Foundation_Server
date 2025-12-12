const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SENDING_EMAIL,
    pass: process.env.SENDING_EMAIL_PASSWORD,
  },
});

module.exports = transporter;
