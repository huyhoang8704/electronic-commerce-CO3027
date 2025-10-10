const Category = require('../models/Category');
const Product = require('../models/Product');

exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        const existing = await Category.findOne({ name });
        if (existing) return res.status(400).json({ message: 'Category already exists' });

        const category = await Category.create({ name, description });
        res.status(201).json({ message: 'Category created successfully', category });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });

        const products = await Product.find({ category: category._id });
        res.json({ category, products });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!category) return res.status(404).json({ message: 'Category not found' });
        res.json({ message: 'Category updated successfully', category });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });

        // Gỡ liên kết category khỏi sản phẩm
        await Product.updateMany({ category: category._id }, { $unset: { category: "" } });

        res.json({ message: 'Category deleted and products unlinked successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
