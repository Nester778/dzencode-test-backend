import { Order, Product } from '../models/Order.js';

export const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id })
            .populate('products')
            .sort({ date: -1 });
        res.json(orders);
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user.id
        }).populate('products');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const createOrder = async (req, res) => {
    try {
        const { title, description, date } = req.body;

        const order = new Order({
            title,
            description,
            date: date || new Date(),
            user: req.user.id
        });

        await order.save();
        res.status(201).json(order);
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateOrder = async (req, res) => {
    try {
        const { title, description, date } = req.body;

        const order = await Order.findOneAndUpdate(
            {
                _id: req.params.id,
                user: req.user.id
            },
            {
                title,
                description,
                date
            },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        console.error('Update order error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteOrder = async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        await Product.deleteMany({ order: req.params.id });
        await Order.findByIdAndDelete(req.params.id);

        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error('Delete order error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};