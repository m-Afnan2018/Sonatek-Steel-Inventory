const mongoose = require('mongoose');

const databaseConnection = () => {
    if (!process.env.MONGODB_URI) {
        console.error('MongoDB URI is not defined');
        process.exit(1);
    }
    mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));
    db.once('open', () => {
        console.log('Connected to MongoDB');
    });
};

module.exports = databaseConnection;