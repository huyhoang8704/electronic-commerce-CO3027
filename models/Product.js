const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: [true, 'Product name is required'], trim: true },
        type: { type: String, enum: ['software', 'hardware', 'combo'], required: true },
        description: String,
        price: { type: Number, required: [true, 'Price is required'], min: 0 },
        category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
        stock: { type: Number, default: 0 },
        warranty: String,
        servicePackage: {
            mode: { type: String, enum: ['SaaS', 'License', 'Custom'], default: 'License' },
            duration: { type: String, default: '1 year' }
        },
        images: [String], // Mảng URL ảnh từ Supabase
    },
    { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema, 'products');
