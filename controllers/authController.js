const jwt = require('jsonwebtoken');
const User = require('../models/User');


// Hàm tạo JWT
function signToken(user) {
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET || 'your_jwt_secret_here',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
}


// Đăng ký (user)
const register = async (req, res, next) => {
    try {
        const { name, email, password, phone } = req.body;
        if (!name || !email || !password || !phone) return res.status(400).json({ error: 'Please provide name, email, password and phone number' });
        const existingEmail = await User.findOne({ email });
        if (existingEmail) return res.status(400).json({ error: 'Email already registered' });

        const existingPhone = await User.findOne({ phone });
        if (existingPhone) return res.status(400).json({ error: 'Phone number already registered' });

        // Tạo user với role user
        const user = await User.create({ name, email, password, phone, role: 'user' });
        const token = signToken(user);

        res.status(201).json({
            token,
            user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role }
        });
    } catch (err) { next(err); }
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
};