import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import orderRoutes from './routes/orders.js';
import productRoutes from './routes/products.js';

import User from './models/User.js';
import { seedInitialData } from './utils/seedData.js';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.io configuration
const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);

// Health check route
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

const activeSessions = new Set();

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    activeSessions.add(socket.id);

    io.emit('activeSessions', activeSessions.size);

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        activeSessions.delete(socket.id);
        io.emit('activeSessions', activeSessions.size);
    });
});

// MongoDB connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB Atlas');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

const initializeData = async () => {
    try {
        // Check if any user exists
        const userCount = await User.countDocuments();

        if (userCount === 0) {
            // Create test user
            const testUser = new User({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            });

            await testUser.save();
            console.log('Test user created: test@example.com / password123');

            // Seed initial data
            await seedInitialData(testUser._id);
        }
    } catch (error) {
        console.error('Error initializing data:', error);
    }
};


// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(500).json({
        message: 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
    await connectDB();
    await initializeData();

    httpServer.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV}`);
        console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
};

startServer().catch(console.error);