const express = require('express');
const router = express.Router();
const requireAuth = require('../middlewares/requireAuth');

const { getAllResults, createResult, getResult, updateResult, deleteResult } = require('../controllers/resultController');

router.route('/').get(getAllResults).post(requireAuth, createResult);
router.route('/:id').get(getResult).put(requireAuth, updateResult).delete(requireAuth, deleteResult);


module.exports = router;
