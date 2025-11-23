import { Product } from '../models/Order.js';
import { Order } from '../models/Order.js';

export const getProducts = async (req, res) => {
    try {
        const { type } = req.query;
        const userOrders = await Order.find({ user: req.user.id });
        const orderIds = userOrders.map(order => order._id);

        let filter = { order: { $in: orderIds } };

        if (type && type !== 'all') {
            filter.type = type;
        }

        const products = await Product.find(filter)
            .populate('order', 'title')
            .sort({ date: -1 });

        res.json(products);
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('order', 'title user');

        if (!product || product.order.user.toString() !== req.user.id) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const createProduct = async (req, res) => {
    try {
        const { orderId, ...productData } = req.body;

        const order = await Order.findOne({
            _id: orderId,
            user: req.user.id
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found or access denied' });
        }

        const product = new Product({
            ...productData,
            order: orderId
        });

        await product.save();
        await product.populate('order', 'title');

        res.status(201).json(product);
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('order', 'user');

        if (!product || product.order.user.toString() !== req.user.id) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const updateData = { ...req.body };

        if (req.body.guarantee) {
            updateData.guarantee = {
                ...product.guarantee.toObject(),
                ...req.body.guarantee
            };
        }

        delete updateData._id;
        delete updateData.__v;

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate('order', 'title');

        res.json(updatedProduct);
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('order', 'user');

        if (!product || product.order.user.toString() !== req.user.id) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};