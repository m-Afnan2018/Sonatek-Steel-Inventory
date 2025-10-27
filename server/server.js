const express = require('express');
const app = express();
require('dotenv').config();

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const cors = require('cors')
app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: "/tmp",
        limits: { fileSize: 50 * 1024 * 1024 },
    })
)
app.use(express.json());
app.use(bodyParser.json())
app.use(cookieParser());
app.use(cors({
    // origin: 'http://localhost:3000',
    origin: `${process.env.CORS_URL}`,
    credentials: true,
}))


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
const userRoutes = require('./routes/userRoutes')
const cutterRoutes = require('./routes/cutterRoutes');
const itemRoutes = require('./routes/itemRoutes')
const bookingRoutes = require('./routes/bookingRoutes')

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/cutters', cutterRoutes);
app.use('/api/v1/item', itemRoutes);
app.use('/api/v1/booking', bookingRoutes);

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

app.listen(port, () => {
    console.log(`Server is running on port ${port}:  http://localhost:${port}`);
});
