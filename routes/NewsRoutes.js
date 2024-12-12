const express = require('express');
const router = express.Router();
const { getNews, createNews, deleteNews, updateNews, getNewsById} = require('../controllers/NewsController');
const upload = require('../config/cloudinaryConfig')

router.post('/news', upload.single('image'), createNews);
router.get('/news', getNews);
router.put('/news/:id', upload.single('image'), updateNews);
router.delete('/news/:id', deleteNews);
router.get('/news/:id', getNewsById);

module.exports = router;