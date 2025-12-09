const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const AdminLogin = mongoose.model("Admin", adminSchema);

module.exports = AdminLogin;
