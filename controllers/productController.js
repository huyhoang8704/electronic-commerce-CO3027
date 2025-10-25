const Product = require('../models/Product');
const supabase = require('../config/supabase');
const path = require('path');
const pagination = require('../helpers/pagination');

// 🟢 Upload nhiều ảnh lên Supabase
const uploadImagesToSupabase = async (files) => {
    const uploadedUrls = [];

    for (const file of files) {
        const ext = path.extname(file.originalname);
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}${ext}`;

        const { data, error } = await supabase.storage
            .from('materials')
            .upload(fileName, file.buffer, {
                cacheControl: '3600',
                upsert: false,
                contentType: file.mimetype,
            });

        if (error) throw error;

        const { data: publicUrlData } = supabase
            .storage
            .from('materials')
            .getPublicUrl(data.path);

        uploadedUrls.push(publicUrlData.publicUrl);
    }

    return uploadedUrls;
};

// 🟩 Thêm sản phẩm mới
exports.createProduct = async (req, res) => {
    try {
        const { name, type, description, price, category, stock, warranty, servicePackage } = req.body;

        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            imageUrls = await uploadImagesToSupabase(req.files);
        }

        const product = await Product.create({
            name,
            type,
            description,
            price,
            category,
            stock,
            warranty,
            servicePackage: JSON.parse(servicePackage || '{}'),
            images: imageUrls
        });

        res.status(201).json({
            code: 0,
            status: 201,
            message: 'Tạo sản phẩm thành công',
            data: product
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

// 🟨 Lấy danh sách sản phẩm
exports.getProducts = async (req, res) => {
    try {
        const { category, type, search } = req.query;
        const query = {};
        if (category) query.category = category;
        if (type) query.type = type;
        if (search) query.name = { $regex: search, $options: 'i' };

        //pagination
        const countProducts = await Product.countDocuments(query)
        let objectPagination = pagination({
            currentPage: 1,
            limitItems: 5
        },req.query, countProducts)
        // Query dữ liệu có phân trang
        const products = await Product.find(query)
        .populate('category')
        .skip(objectPagination.skip)
        .limit(objectPagination.limitItems)
        .sort({ createdAt: -1 });

        //const products = await Product.find(query).populate('category');
        // res.json(products);
        return res.status(200).json({
            code: 0,
            status: 200,
            message: 'Lấy danh sách sản phẩm thành công',
            data: {
              pagination: objectPagination,
              totalProducts: countProducts,
              products
            }
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

// 🟦 Lấy chi tiết sản phẩm
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category');
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.status(200).json({
            code: 0,
            status: 200,
            message: 'Lấy chi tiết sản phẩm thành công',
            data: product
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

// 🟧 Cập nhật sản phẩm
exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ 
            code: 1,
            status: 404,
            message: 'Không tìm thấy sản phẩm',
            data: null
        });

        // Upload ảnh mới nếu có
        if (req.files && req.files.length > 0) {
            const newImages = await uploadImagesToSupabase(req.files);
            product.images = [...product.images, ...newImages];
        }

        Object.assign(product, req.body);
        await product.save();

        res.status(200).json({
            code: 0,
            status: 200,
            message: 'Cập nhật sản phẩm thành công',
            data: product
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

// 🟥 Xóa sản phẩm
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ 
            code: 1,
            status: 404,
            message: 'Không tìm thấy sản phẩm',
            data: null
        });
        res.status(200).json({
            code: 0,
            status: 200,
            message: 'Xóa sản phẩm thành công',
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
