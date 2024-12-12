const express = require('express');
const { login, register, getAllUser, getUserById, updateUser, deleteUser  } = require('../controllers/UserController');
const upload = require('../config/cloudinaryConfig')

const router = express.Router();

router.post('/user/login', login);
router.post('/user/register', register);
router.get('/user', getAllUser);
router.get('/user/:id', getUserById);
router.put("/user/update/:id", upload.single("avatar"), updateUser)
router.delete("/user/delete/:id", deleteUser)

module.exports = router;