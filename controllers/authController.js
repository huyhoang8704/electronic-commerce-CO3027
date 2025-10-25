const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OtpVerification = require('../models/OtpVerification');


// Hàm tạo JWT
function signToken(user) {
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET || 'your_jwt_secret_here',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
}
const sendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "Email already registered" });

    await OtpVerification.deleteMany({ email });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    await OtpVerification.create({
      email,
      otpCode,
      otpExpires,
      isVerified: false,
    });

    console.log(`OTP for ${email}: ${otpCode}`);

    return res.status(200).json({
      message: "OTP sent successfully (fake)",
      fakeOtp: otpCode, // test only
    });
  } catch (err) {
    next(err);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ error: "Email and OTP required" });

    const record = await OtpVerification.findOne({ email });
    if (!record) return res.status(400).json({ error: "OTP not found" });

    if (record.otpCode !== otp)
      return res.status(400).json({ error: "Invalid OTP" });

    if (record.otpExpires < Date.now())
      return res.status(400).json({ error: "OTP expired" });

    record.isVerified = true;
    await record.save();

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (err) {
    next(err);
  }
};

// Đăng ký (user)
const register = async (req, res, next) => {
  try {
    const { email, name, password, phone } = req.body;

    if (!email || !name || !password || !phone)
      return res.status(400).json({ error: "Missing required fields" });

    const otpRecord = await OtpVerification.findOne({ email });
    if (!otpRecord || !otpRecord.isVerified)
      return res.status(400).json({ error: "Email not verified" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "Email already registered" });

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: "user",
    });

    // Xóa record OTP sau khi đăng ký thành công
    await OtpVerification.deleteOne({ email });

    const token = signToken(user);

    res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (err) {
    next(err);
  }
};
// Đăng ký (admin)
const registerAdmin = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        const existingEmail = await User.findOne({ email });
        if (existingEmail) return res.status(400).json({ message: 'Email already exists' });
        const existingPhone = await User.findOne({ phone });
        if (existingPhone) return res.status(400).json({ message: 'Phone number already exists' });

        // Tạo user với role admin
        const user = await User.create({ name, email, password, phone, role: 'admin' });

        res.status(201).json({ token: signToken(user), user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Đăng nhập
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });


        if (!user) return res.status(400).json({ error: 'Invalid credentials' });


        const match = await user.comparePassword(password);
        if (!match) return res.status(400).json({ error: 'Invalid credentials' });

        const token = signToken(user);

        res.json({
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err) { next(err); }
};


// Lấy thông tin cá nhân (me)
const me = async (req, res) => {
    res.json({ user: req.user });
};

module.exports = { 
    register, 
    login, 
    me,
    registerAdmin,
    sendOtp,
    verifyOtp, 
};