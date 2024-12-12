// config/cloudinaryConfig.js

const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'Home', // Folder in Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'], // Allowed formats
  },
});

// Create Multer instance
const upload = multer({ storage: storage });

module.exports = upload;
