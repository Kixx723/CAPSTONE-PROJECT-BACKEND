const Event = require('../models/eventModel');
const Schedule = require('../models/scheduleModel');
const SportEvent = require('../models/sportEventModel');
const Match = require('../models/matchModel');
const Result = require('../models/resultModel');
const Department = require('../models/departmentModel');
const asyncHandler = require('express-async-handler');
const fs = require('fs');
const path = require('path');


const eventReports = asyncHandler(async (req, res) => {
  const { id: eventID } = req.params;
  const sportEvents = await SportEvent.find({ event: eventID });

  if (!sportEvents) {
      return res.status(404).json({ msg: "No Sport Events found" });
  }

  // Retrieve all results where sport event IDs match the found sport events
  const sportEventIds = sportEvents.map(event => event._id);
  const results = await Result.find({ sportevent: { $in: sportEventIds } })
    .populate('sportevent')
    .populate('gold')
    .populate('silver')
    .populate('bronze');

  res.status(200).json({ sportEvents, results });
});

const getAllEvents = asyncHandler(async (req, res) => {
    const { search } = req.query;
    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } }, // Case-insensitive search on event name 
          // Add more fields to search as needed
        ],
      };
    }

    const event = await Event.find(query); // retrieve all the events schema in the database
    res.status(200).json({ event });
});

const getSearchSportEvents = asyncHandler(async (req, res) => {
  const { id: eventID } = req.params;
  const { search } = req.query;
  let query = {};
  if (search) {
    query = {
      $or: [
        { name: { $regex: search, $options: 'i'} },
      ],
    };
  }

  // const event = await Event.findOne({ _id: eventID }); // retrieve single element with the id
  const sportevents = await SportEvent.find({ event: eventID, ...query });

  return res.status(201).json({ sportevents });

});

const createEvent = asyncHandler(async (req, res) => {
    const { name, startDate, endDate } = req.body; // to create a event in database using the request body
    const existingEventName = await Event.findOne({ name: name});
  
    if(existingEventName) {
        return res.status(400).json({ error: 'Event Name is already exist!' });
    }

    const start= new Date(req.body.startDate);
    const end = new Date(req.body.endDate);
    if (start > end) { //custom validation for dates start and date end
        return res.status(400).json({ error: 'Invalid Date Range: Start date must be before end date.' });
    }

    const image = req.file ? req.file.filename : '';

    const event = await Event.create({ name, startDate, endDate, image });
    res.status(201).json({ event });
});

const getSingleEvent = asyncHandler(async (req, res) => {
  const { id: eventID } = req.params;
  const event = await Event.findOne({ _id: eventID });

  res.status(200).json({ event });
});

const getEvent = asyncHandler(async (req, res) => {
  const { id: eventID } = req.params;
  const { search } = req.query;
    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } }, // Case-insensitive search on event name 
          // Add more fields to search as needed
        ],
      };
    }

  const event = await Event.findOne({ _id: eventID }); // retrieve single element with the id
  const sportevents = await SportEvent.find({ event: eventID, ...query }).populate('event'); // retrieve all the sportevents with referencing the id of event
    
  if(!event) {
      return res.status(404).json({ msg: `No Event with id : ${eventID}` });
  }

  const departments = await Department.find();
  // Object to store the medal tally for each department
  const medalTally = {};

  // Initialize medalTally with default entries for each department
for (const department of departments) {
  const departmentID = department._id.toString();
  medalTally[departmentID] = {
    department: department,
    gold: 0,
    silver: 0,
    bronze: 0,
    total: 0,
  };
}

// Iterate through each sport event
for (const sportevent of sportevents) {
  // Find the results for the current sport event
  const results = await Result.find({ sportevent: sportevent._id })
    .populate('gold silver bronze');
  
  // Calculate the medal count for this sport event
  const goldMedalCount = sportevent.medalCount;
  const silverMedalCount = sportevent.medalCount;
  const bronzeMedalCount = sportevent.medalCount;

  // Iterate through each result
  for (const result of results) {
    const goldDepartmentID = result.gold._id.toString();
    const silverDepartmentID = result.silver._id.toString();
    const bronzeDepartmentID = result.bronze._id.toString();

    // Update the medal tally for the gold department
    medalTally[goldDepartmentID].gold += goldMedalCount;
    medalTally[goldDepartmentID].total += goldMedalCount;
    
    // Update the medal tally for the silver department
    medalTally[silverDepartmentID].silver += silverMedalCount;
    medalTally[silverDepartmentID].total += silverMedalCount;

    // Update the medal tally for the bronze department
    medalTally[bronzeDepartmentID].bronze += bronzeMedalCount;
    medalTally[bronzeDepartmentID].total += bronzeMedalCount;
  }
}

// Convert medalTally object to an array of values
const medalRanking = Object.values(medalTally);
  
  //sort order based on gold, silver, bronze, and total medals:
  medalRanking.sort((a, b) => {
    const medalOrder = ['gold', 'silver', 'bronze']; 
    
    for (const medal of medalOrder) {
        if (b[medal] !== a[medal]) {
            return b[medal] - a[medal];
        }
    }
    return (b.gold + b.silver + b.bronze) - (a.gold + a.silver + a.bronze);
});

  res.status(200).json({ event, sportevents, medalTally: medalRanking });
});


const updateEvent = asyncHandler(async (req, res) => {
    const { id: eventID } = req.params;
    const { name, startDate, endDate } = req.body;

    const existingImage = Event.findOne({ id:eventID });

    const image = req.file ? req.file.filename : existingImage.image;

    const existingEvent = await Event.findById(eventID);

    if (req.body.name !== existingEvent.name) {
      const existingEventName = await Event.findOne({ name: req.body.name });
      
      if (existingEventName) {
        return res.status(400).json({ error: 'Event Name already exists' });
      }
    }

    if(req.file) {
      if(existingEvent.image) {
        const imagePath = path.join(__dirname, '../public/Images', existingEvent.image);
        fs.unlinkSync(imagePath);
      }
      existingEvent.image = req.file.filename;
    }
    
    const start= new Date(req.body.startDate);
    const end = new Date(req.body.endDate);

    if (start > end) { //custom validation for dates start and date end
      return res.status(400).json({ error: 'Start date must be before the end date' });
    }

    const event = await Event.findOneAndUpdate({_id: eventID }, {name, startDate, endDate, image}, {
        new: true,
        runValidators: true,
        overwrite: true,
    });
    
    if(!event) {
        return res.status(404).json({ msg: `No Event with id : ${eventID}` });
    }
  
    res.status(201).json({ event });
});

const deleteEvent = asyncHandler(async (req, res) => {
    const { id: eventID } = req.params;
    const event = await Event.findOneAndDelete({_id: eventID });
    if(!event) {
        return res.status(404).json({ msg: `No Event with id : ${eventID}`});
    }

    if(event.image) {
      const imagePath = path.join(__dirname, '../public/Images', event.image);
      fs.unlinkSync(imagePath);
    }

    // get the sporteventID's that been deleted if the event deleted
    const sportevents = await SportEvent.find({ event: eventID });
    const sportEventID = await sportevents.map((id) => id._id);

    // get the schedulesID's that been deleted if the event deleted
    const schedules = await Schedule.find({ sportevent: sportEventID });
    const scheduleID = await schedules.map((id) => id._id);

    // delete all the associated sportevents that referencing the of deleted event
    await SportEvent.deleteMany({ event: eventID });
    
    // delete the associated schedules that referencing the id of deleted sportevents 
    await Schedule.deleteMany({ sportevent: { $in: sportEventID } });

    // delete the associated result that referencing the id of deleted sportevents 
    await Result.deleteMany({ sportevent: { $in: sportEventID } });
    
    // delete the associated matches that referencing the id of deleted schedules
    await Match.deleteMany({ schedule: { $in: scheduleID } }); 
    res.status(201).json({ event, success: true });
});

module.exports = {
    eventReports,
    getAllEvents,
    getSearchSportEvents,
    createEvent,
    getSingleEvent,
    getEvent,
    updateEvent,
    deleteEvent,
};

// const getEvent = asyncHandler(async (req, res) => {
//   const { id: eventID } = req.params;
//   const { search } = req.query;
//     let query = {};
//     if (search) {
//       query = {
//         $or: [
//           { name: { $regex: search, $options: 'i' } }, // Case-insensitive search on event name 
//           // Add more fields to search as needed
//         ],
//       };
//     }

//   const event = await Event.findOne({ _id: eventID }); // retrieve single element with the id
//   const sportevents = await SportEvent.find({ event: eventID, ...query }).populate('event'); // retrieve all the sportevents with referencing the id of event
    
//   if(!event) {
//       return res.status(404).json({ msg: `No Event with id : ${eventID}` });
//   }

//   const departments = await Department.find();
//   // Object to store the medal tally for each department
//   const medalTally = {};

//   // Initialize medalTally with default entries for each department
//   for (const department of departments) { // Replace 'departments' with the actual list of departments
//     const departmentID = department._id.toString();
//     medalTally[departmentID] = {
//       department: department,
//       gold: 0,
//       silver: 0,
//       bronze: 0,
//       total: 0,
//     };
//   }
  
//   // Iterate through each sport event
//   for (const sportevent of sportevents) {
//     // Find the results for the current sport event
//     const results = await Result.find({ sportevent: sportevent._id })
//       .populate('gold silver bronze');
    
//     // Iterate through each result
//     for (const result of results) {
//       const goldDepartmentID = result.gold._id.toString();
//       const silverDepartmentID = result.silver._id.toString();
//       const bronzeDepartmentID = result.bronze._id.toString();
  
//       // Update the medal tally for the gold department
//       medalTally[goldDepartmentID].gold++;
//       medalTally[goldDepartmentID].total++;
  
//       // Update the medal tally for the silver department
//       medalTally[silverDepartmentID].silver++;
//       medalTally[silverDepartmentID].total++;
  
//       // Update the medal tally for the bronze department
//       medalTally[bronzeDepartmentID].bronze++;
//       medalTally[bronzeDepartmentID].total++;
//     }
//   }
  
//   // Convert medalTally object to an array of values
//   const medalRanking = Object.values(medalTally);
  
//   //sort order based on gold, silver, bronze, and total medals:
//   medalRanking.sort((a, b) => {
//     const medalOrder = ['gold', 'silver', 'bronze']; 
    
//     for (const medal of medalOrder) {
//         if (b[medal] !== a[medal]) {
//             return b[medal] - a[medal];
//         }
//     }
//     return (b.gold + b.silver + b.bronze) - (a.gold + a.silver + a.bronze);
// });

//   res.status(200).json({ event, sportevents, medalTally: medalRanking });
// });