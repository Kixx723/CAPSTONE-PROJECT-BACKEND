const express = require('express');
const router = express.Router();
const requireAuth = require('../middlewares/requireAuth');
const upload = require('../middlewares/multer');



const { eventReports, getAllEvents, createEvent, getSingleEvent, getEvent, updateEvent, deleteEvent, getSearchSportEvents } = require('../controllers/eventController');

router.route('/').get(getAllEvents).post(requireAuth, upload.single('image') , createEvent); // requiring auth for creating event route
router.route('/:id').get(getEvent).put(requireAuth, upload.single('image') , updateEvent).delete(requireAuth, deleteEvent);
router.route('/:id/single-event').get(getSingleEvent);
router.route('/:id/sportevents').get(getSearchSportEvents);
router.route('/:id/reports').get(eventReports);

module.exports = router;