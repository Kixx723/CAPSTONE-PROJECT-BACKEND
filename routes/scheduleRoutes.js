const express = require('express');
const router = express.Router();
const requireAuth = require('../middlewares/requireAuth');

const { getAllSchedules, createSchedule, getSchedule, updateSchedule, deleteSchedule } = require('../controllers/scheduleController');

router.route('/').get(getAllSchedules).post(requireAuth, createSchedule);
router.route('/:id').get(getSchedule).put(requireAuth, updateSchedule).delete(requireAuth, deleteSchedule);


module.exports = router;