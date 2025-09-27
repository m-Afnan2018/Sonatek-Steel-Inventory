const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
app.use(bodyParser.json())
app.use(cookieParser());

require('dotenv').config();

// Database connection
const databaseConnection = require('./configs/database');
databaseConnection();

// Cloudinary configuration
const cloudinaryConnection = require('./configs/cloudinary');
cloudinaryConnection(process.env.CLOUDINARY_CLOUD_NAME, process.env.CLOUDINARY_API_KEY, process.env.CLOUDINARY_API_SECRET);

const port = process.env.PORT || 3000;

app.route('/').get((req, res) => {
  res.send('Welcome to the Sonatek Steel Inventory API');
});


// Importing routes
const authRoutes = require('./routes/authRoutes')

app.use('/api/v1/auth', authRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}:  http://localhost:${port}`);
});
