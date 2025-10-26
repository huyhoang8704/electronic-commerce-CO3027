const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Company name is required'],
            trim: true
        },
        taxCode: {
            type: String,
            match: [/^[0-9]{8,15}$/, 'Invalid tax code format']
        },
        address: String,
        field: String, // lĩnh vực hoạt động
        contactEmail: {
            type: String,
            match: [/\S+@\S+\.\S+/, 'Please use a valid email address']
        },
        contactPhone: {
            type: String,
            match: [/^\d{10,15}$/, 'Phone number must be between 10 and 15 digits']
        },
        owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Company', companySchema, 'companies');
