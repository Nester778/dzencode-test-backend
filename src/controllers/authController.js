import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: 'Invalid credentials',
                data: null
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({
                message: 'Invalid credentials',
                data: null
            });
        }

        const token = generateToken(user._id);

        const response = {
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        };

        res.json({
            message: 'Login successful',
            data: response
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            message: 'Server error during login',
            data: null
        });
    }
};

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: 'User already exists',
                data: null
            });
        }

        const user = new User({ name, email, password });
        await user.save();

        const token = generateToken(user._id);

        const response = {
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        };

        res.status(201).json({
            message: 'Registration successful',
            data: response
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            message: 'Server error during registration',
            data: null
        });
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};