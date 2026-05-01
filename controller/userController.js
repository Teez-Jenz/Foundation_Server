const subscriber = require("../model/subcriberModel");
const { hash, compare } = require("../middleware/passwordHash");
const Admin = require("../model/adminModel");
const transporter = require("../config/email");
const jwt = require("jsonwebtoken");

exports.welcome = (req, res) => {
  res.send("you are welcome");
};

exports.subscribeUser = async (req, res) => {
  try {
    const { firstName, email } = req.body;

    // ✅ 1. Basic validation
    if (!firstName || !email) {
      return res.status(400).json({
        success: false,
        message: "First name and email are required",
      });
    }

    // simple email check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // ✅ 2. Save user
    const newSubscriber = await subscriber.create({
      firstName,
      email,
    });

    // ✅ 3. Send email (non-blocking)
    transporter
      .sendMail({
        from: `"Princess Agunloye Joktade" <${process.env.SENDING_EMAIL}>`,
        to: email,
        subject: "Welcome to our Foundation",
        text: `Hello ${firstName}, welcome to our foundation.`,
        html: `
        <h2>Hello ${firstName},</h2>
        <p>Thanks for subscribing to our foundation.</p>
        <p>We’ll keep you updated.</p>

        <hr/>
        <p style="font-size:12px;color:gray;">
          You received this email because you signed up on our website.
        </p>
      `,
      })
      .then(() => console.log("✅ Email sent"))
      .catch((err) => console.error("❌ Email failed:", err));

    // ✅ 4. Respond immediately (don’t wait for email)
    return res.status(201).json({
      success: true,
      message: "Subscription successful",
      data: newSubscriber,
    });
  } catch (err) {
    // ✅ 5. Handle duplicate email
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    console.error("❌ Server error:", err);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
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

    const hashPassword = await hash(password);

    const newAdmin = new Admin({
      name: name || `Admin${Date.now()}`,
      email,
      password: hashPassword,
    });

    await newAdmin.save();

    return res.status(201).json({
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
        message: "Both email and password are required",
      });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await compare(password, admin.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: "2h" },
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
    });
  } catch (err) {
    console.error("Admin login failed", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server error",
    });
  }
};