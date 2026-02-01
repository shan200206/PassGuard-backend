require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const passwordRoutes = require('./routes/passwordRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(express.json());
app.use(cors());

// Health check endpoint (doesn't require MongoDB)
app.get('/health', (req, res) => {
    const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    res.status(200).json({
        status: 'ok',
        mongodb: mongoStatus,
        timestamp: new Date().toISOString()
    });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/passwords', passwordRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Check for required environment variables
if (!process.env.MONGO_URI) {
    console.error('ERROR: MONGO_URI environment variable is not set');
    process.exit(1);
}

if (!process.env.PORT) {
    console.error('ERROR: PORT environment variable is not set');
    process.exit(1);
}

if (!process.env.JWT_SECRET) {
    console.error('ERROR: JWT_SECRET environment variable is not set');
    process.exit(1);
}

if (!process.env.ENCRYPTION_KEY) {
    console.error('ERROR: ENCRYPTION_KEY environment variable is not set');
    process.exit(1);
}

const PORT = process.env.PORT || 3000;

// MongoDB connection options
const mongooseOptions = {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
};

mongoose.connect(process.env.MONGO_URI, mongooseOptions)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
        });
    })
    .catch(err => {
        console.error('\n❌ MongoDB connection error:');
        console.error('   Error:', err.message);
        
        // Show connection string (masked for security)
        const mongoUri = process.env.MONGO_URI || 'not set';
        const maskedUri = mongoUri.includes('@') 
            ? mongoUri.replace(/(:\/\/)([^:]+):([^@]+)@/, '$1***:***@')
            : mongoUri;
        console.error('   Attempted connection to:', maskedUri);
        
        console.error('\n💡 Troubleshooting steps:');
        console.error('   1. Make sure MongoDB is installed and running');
        console.error('   2. Check if MongoDB service is started:');
        console.error('      Windows: Open Services (services.msc) and start "MongoDB" service');
        console.error('      Or run in terminal: mongod --dbpath "C:\\data\\db"');
        console.error('   3. Verify MONGO_URI in .env file is correct');
        console.error('   4. Default MongoDB URI: mongodb://localhost:27017/password-manager');
        console.error('   5. If using MongoDB Atlas, check your connection string and IP whitelist\n');
        process.exit(1);
    });