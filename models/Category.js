const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
    {
        name: { type: String, required: [true, 'Category name is required'], trim: true },
        //cac category con trong category cha
        parent_id: String,
        description: { type: String }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema, 'categories');
