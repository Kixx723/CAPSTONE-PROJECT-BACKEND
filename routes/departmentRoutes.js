const express = require('express');
const router = express.Router();
const requireAuth = require('../middlewares/requireAuth');

const { getAllDepartments, createDepartment, getDepartment, updateDepartment, deleteDepartment } = require('../controllers/departmentController');

router.route('/').get(getAllDepartments).post(requireAuth, createDepartment);
router.route('/:id').get(getDepartment).put(requireAuth, updateDepartment).delete(requireAuth, deleteDepartment);

module.exports = router;

