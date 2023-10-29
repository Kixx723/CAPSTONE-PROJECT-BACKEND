const express = require('express');
const router = express.Router();
const requireAuth = require('../middlewares/requireAuth');

const {changePassword, getAllUsers, loginUser, registerUser, getUser, updateUser, deleteUser } = require('../controllers/userController');


router.route('/login').post(loginUser);
router.route('/register').post(requireAuth, registerUser);
router.route('/').get(getAllUsers)
router.route('/:id').get(getUser).put(requireAuth, updateUser).delete(requireAuth, deleteUser);
router.route('/change-password/:id').post(requireAuth, changePassword);


module.exports = router;