const Company = require('../models/Company');
const User = require('../models/User');

exports.createCompany = async (req, res) => {
    try {
        const { name, taxCode, address, field, contactEmail, contactPhone } = req.body;

        const company = await Company.create({
            name, taxCode, address, field, contactEmail, contactPhone,
            owner: req.user._id
        });

        // Gắn company cho user
        await User.findByIdAndUpdate(req.user._id, { company: company._id });

        res.status(201).json({
            code: 0,
            status: 201,
            message: 'Tạo công ty thành công',
            data: company
        });
    } catch (err) {
        res.status(500).json({
            code: 1,
            status: 500,
            message: err.message,
            data: null
        });
    }
};

exports.getMyCompany = async (req, res) => {
    try {
        const company = await Company.findOne({ owner: req.user._id });
        if (!company) return res.status(404).json({
            code: 1,
            status: 404,
            message: 'Không tìm thấy công ty nào cho người dùng này',
            data: null
        });
        res.status(200).json({
            code: 0,
            status: 200,
            message: 'Lấy thông tin công ty thành công',
            data: company
        });
    } catch (err) {
        res.status(500).json({
            code: 1,
            status: 500,
            message: err.message,
            data: null});
    }
};

exports.updateCompany = async (req, res) => {
    try {
        const company = await Company.findOneAndUpdate(
            { owner: req.user._id },
            req.body,
            { new: true }
        );
        if (!company) return res.status(404).json({
            code: 1,
            status: 404,
            message: 'Không tìm thấy công ty để cập nhật',
            data: null
        });
        res.status(200).json({
            code: 0,
            status: 200,
            message: 'Cập nhật công ty thành công',
            data: company
        });
    } catch (err) {
        res.status(500).json({
            code: 1,
            status: 500,
            message: err.message,
            data: null
        });
    }
};
