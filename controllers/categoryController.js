const Category = require('../models/Category');
const Product = require('../models/Product');

exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        const existing = await Category.findOne({ name });
        if (existing) return res.status(400).json({
            code: 1,
            status: 400,
            message: 'Danh mục đã tồn tại',
            data: null
        });

        const category = await Category.create({ name, description });
        res.status(201).json({
            code: 0,
            status: 201,
            message: 'Tạo danh mục thành công',
            data: category
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

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json({
            code: 0,
            status: 200,
            message: 'Lấy danh sách danh mục thành công',
            data: categories
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

exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({
            code: 1,
            status: 404,
            message: 'Không tìm thấy danh mục',
            data: null
        });

        const products = await Product.find({ category: category._id });
        res.status(200).json({
            code: 0,
            status: 200,
            message: 'Lấy chi tiết danh mục và sản phẩm thành công',
            data: { category, products }
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

exports.updateCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!category) return res.status(404).json({
            code: 1,
            status: 404,
            message: 'Không tìm thấy danh mục để cập nhật',
            data: null
        });
        res.status(200).json({
            code: 0,
            status: 200,
            message: 'Cập nhật danh mục thành công',
            data: category
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

exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) return res.status(404).json({
            code: 1,
            status: 404,
            message: 'Không tìm thấy danh mục để xóa',
            data: null
        });

        // Gỡ liên kết category khỏi sản phẩm
        await Product.updateMany({ category: category._id }, { $unset: { category: "" } });

        res.status(200).json({
            code: 0,
            status: 200,
            message: 'Xóa danh mục và gỡ liên kết sản phẩm thành công',
            data: null
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
