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

        res.status(201).json({ message: 'Company created successfully', company });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMyCompany = async (req, res) => {
    try {
        const company = await Company.findOne({ owner: req.user._id });
        if (!company) return res.status(404).json({ message: 'No company found for this user' });
        res.json(company);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateCompany = async (req, res) => {
    try {
        const company = await Company.findOneAndUpdate(
            { owner: req.user._id },
            req.body,
            { new: true }
        );
        if (!company) return res.status(404).json({ message: 'Company not found' });
        res.json({ message: 'Company updated successfully', company });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
