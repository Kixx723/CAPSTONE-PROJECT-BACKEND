const SportEvent = require('../models/sportEventModel');
const Event = require('../models/eventModel');
const Schedule = require('../models/scheduleModel');
const Match = require('../models/matchModel');
const Result = require('../models/resultModel');
const asyncHandler = require('express-async-handler');



const getEventInSportEvents = asyncHandler(async (req, res) => {
    const { id: eventID } = req.params;
    const event = await Event.findOne({ _id: eventID }); // retrieve single element with the id

    if(!event) {
        return res.status(404).json({ msg: `No Event with id : ${eventID}` });
    }
    
    res.status(201).json({ event });
});


const getAllSportEvents = asyncHandler(async (req, res) => {
    
    const sportEvent = await SportEvent.find({}).populate('event'); // retrieve all the sport events schema in the database
    res.status(201).json({ sportEvent });
});

const createSportEvent = asyncHandler(async (req, res) => {
    const { name, event, venue, startDate, endDate, medalCount } = req.body;  // to create a sport event in database using the request body
    const existingEvent = await Event.findOne({ _id : event });
    const existingSportEventName = await SportEvent.findOne({ name: name, event: event });
    if(existingSportEventName) {
        return res.status(400).json({ error: 'SportEvent with the same name and event already exists' });
    }

    if (req.body.startDate > req.body.endDate) { //custom validation for dates start and date end
        return res.status(400).json({ error: 'Start date must be before the end date' });
    }
    
    if (!existingEvent) { // custom validation 
        return res.status(400).json({ error: 'Invalid Event ID' });
    }

    if (medalCount <= 0) {
        return res.status(400).json({ error: 'Medal count must be greater than zero' });
    }
    

    const sportEvent = await SportEvent.create({
        name,
        event: existingEvent._id , //  is used to assign the id of the existing Event document to the event field of the newly created SportEvent.
        venue,
        startDate,
        endDate,
        medalCount,
    });
    res.status(201).json({ sportEvent });
});

// get Single SportEvent
const getSportEvent = asyncHandler(async (req, res) => {
    const { id: sportEventID } = req.params;
    const sportEvent = await SportEvent.findOne({_id: sportEventID }).populate('event'); // retrieve single element with the id
    const schedule = await Schedule.find({ sportevent: sportEventID }).populate('sportevent').populate('department1').populate('department2');
    const result = await Result.find({ sportevent: sportEventID }).populate('sportevent').populate('gold').populate('silver').populate('bronze');
    if(!sportEvent) {
        return res.status(404).json({ msg: `No Sport Event with id : ${sportEventID}` });
    };
    res.status(200).json({ sportEvent, schedule, result });
});

const updateSportEvent = asyncHandler(async (req, res) => {
    const { id: sportEventID } = req.params;
    const existingEvent = await Event.findOne({ _id: req.body.event });

    if (!existingEvent) {
        return res.status(400).json({ error: 'Invalid Event ID' });
    }
    
    if (req.body.startDate > req.body.endDate) {
        // Custom validation for start and end dates
        return res.status(400).json({ error: 'Start date must be before the end date' });
    }
    
    const existingSportEvent = await SportEvent.findById(sportEventID);

    if (!existingSportEvent) {
        return res.status(404).json({ msg: `No Sport Event with id: ${sportEventID}` });
    }
    
    if (req.body.name !== existingSportEvent.name || req.body.event !== existingSportEvent.event.toString()) {
        const existingSportEventName = await SportEvent.findOne({ name: req.body.name, event: req.body.event });
    
        if (existingSportEventName) {
          return res.status(400).json({ error: 'Sport Event with the same name and event already exists' });
        }
    }

    // gina validate na ang  medalCount field kay ma  ensure na integer lang gina accept
    if (req.body.medalCount <= 0) {
        return res.status(400).json({ error: 'Medal count must be greater than zero' });
    }

    const sportEvent = await SportEvent.findOneAndUpdate({ _id: sportEventID }, req.body, {
        new: true,
        runValidators: true,
        overwrite: true,
    });

    res.status(201).json({ sportEvent });
});

//dungag ug functionality sa result na dapat ma delete sad siya
const deleteSportEvent = asyncHandler(async (req, res) => {
    const { id: sportEventID } = req.params;
    const sportEvent = await SportEvent.findOneAndDelete({_id: sportEventID });
    if(!sportEvent) {
        return res.status(404).json({ msg: `No Sport Event with id : ${sportEventID}`});
    }
    // getting the schedulesID that the sportevent are referencing
    const schedules = await Schedule.find({ sportevent: sportEventID });
    const scheduleID = await schedules.map((id) => id._id);
    
    // delete associated result referencing the SportEvent id
    await Result.deleteMany({ sportevent: sportEventID });

    // delete associated schedules referencing the SportEvent id
    await Schedule.deleteMany({ sportevent: sportEventID });
    
    // delete all matches that referencing into schedules id that deleted
    await Match.deleteMany({ schedule: { $in: scheduleID }});


    // console.log('scheduleIDs: ', scheduleID);
     
    res.status(201).json({ sportEvent });
});


module.exports = {
    getEventInSportEvents,
    getAllSportEvents,
    createSportEvent,
    getSportEvent,
    updateSportEvent,
    deleteSportEvent,
};
