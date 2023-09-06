import mongoose from 'mongoose';

// Define your MongoDB URI with your actual password
const uri = "mongodb+srv://Meron-Michael:07448717@cluster1.lhcceb8.mongodb.net";

// Connect to MongoDB using Mongoose
mongoose.connect(uri);

// Create a reference to the default connection
const db = mongoose.connection;

// Event listeners for database connection events
db.on('error', (error) => {
    console.error('MongoDB connection error:', error);
});

db.once('open', () => {
    console.log('Connected to MongoDB!');
});

db.on('disconnected', () => {
    console.log('MongoDB disconnected.');
});

// You can now define your Mongoose models and perform database operations here
