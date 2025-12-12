const subscriber = require("../model/subcriberModel");
const { hash, compare } = require("../middleware/passwordHash");
const Admin = require("../model/adminModel");
const transporter = require("../config/email");
const jwt = require("jsonwebtoken");

exports.welcome = (req, res) => {
  res.send("you are welcome");
};

exports.subscribe = async (req, res) => {
  const { firstName, email } = req.body;
  try {
    if (!firstName || !email) {
      return res
        .status(400)
        .json({ success: false, message: "Both fields are required" });
    }

    const existingSubscriber = await subscriber.findOne({ email });
    if (existingSubscriber) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exist" });
    }

    const newSubscriber = await subscriber.create({
      firstName,
      email,
    });

    try {
      await transporter.sendMail({
        from: "Princess Agunloye Joktade",
        to: email,
        subject: "Welcome to our Foundation",
        html: `
        <h2>Hello ${firstName}, </h2>
        <p>Welcome! Your account has been created successfully.</p>
        <p>Thank you for joining us!</p>
      `,
      });
    } catch (emailError) {
      console.error("Email failed", emailError);
      return res.status(500).json({
        success: false,
        message: "Subscription saved but email was not sent.",
        error: emailError,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Subscription Successfull!!!",
      data: newSubscriber,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });
    }
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

exports.allSubscribers = async (req, res) => {
  try {
    const registerUser = await subscriber.find().sort({ createdAt: -1 });
    return res
      .status(200)
      .json({ success: true, message: "All the subscribers", registerUser });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

exports.registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Both email and password is required",
      });
      return;
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be minimum of 8 characters",
      });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      res.status(400).json({ success: false, message: "Admin already exist" });
      return;
    }

    const hashPassword = await hash({ password });

    const newAdmin = Admin({
      name: name || `Admin${Date.now()}`,
      email,
      password: hashPassword,
    });

    await newAdmin.save();

    return res.status(200).json({
      success: true,
      message: "A new Admin has been registered successfully ",
    });
  } catch (err) {
    console.error("Admin registration error", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Both email ans password is required",
      });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await compare({
      password,
      hashPassword: admin.password,
    });
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res
      .status(200)
      .json({ success: true, message: "Login successful", token });
  } catch (err) {
    console.error("Admin login failed", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server error" });
  }
};
