const express = require('express');
const router = express.Router();
const requireAuth = require('../middlewares/requireAuth');

const { getEventInSportEvents, getAllSportEvents, createSportEvent, getSportEvent, updateSportEvent, deleteSportEvent } = require('../controllers/sportEventController');

router.route('/').get(getAllSportEvents).post(requireAuth, createSportEvent);
router.route('/:id').get(getSportEvent).put(requireAuth, updateSportEvent).delete(requireAuth, deleteSportEvent);
router.route('/event/:id').get(getEventInSportEvents);

module.exports = router;