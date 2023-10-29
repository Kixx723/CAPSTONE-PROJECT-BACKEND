const Schedule = require('../models/scheduleModel');
const Match = require('../models/matchModel');
const SportEvent = require('../models/sportEventModel');
const Department = require('../models/departmentModel');
const asyncHandler = require('express-async-handler');

const getAllSchedules = asyncHandler(async (req, res) => {
    const schedule = await Schedule.find({})
    .populate('sportevent')
    .populate('department1')
    .populate('department2');
    res.status(201).json({ schedule });
});

const createSchedule = asyncHandler(async (req, res) => {
    const { scheduleDateTime, sportevent, department1, department2 } = req.body;

    const existingSportEvent = await SportEvent.findOne({ _id: sportevent });

    const isSwimmingOrRunningEvent = /(swimming|running)/i.test(existingSportEvent.name);

    if(isSwimmingOrRunningEvent) {
        const existingSchedule = await Schedule.findOne({ scheduleDateTime: scheduleDateTime, sportevent: sportevent });
        const existingSportEvent = await SportEvent.findOne({ _id: sportevent });

        if(existingSchedule) {
            return res.status(400).json({ error: 'SportEvent Schedule Date and Time already exist' });
        }
         
         if(!existingSportEvent) {
            return res.status(404).json({ error: 'SportEvent ID not found in existing SportEvents' });
         }

        const schedule = await Schedule.create({
            scheduleDateTime,
            sportevent: existingSportEvent._id,
        });

        return res.status(201).json({ schedule });
    }

    const existingSchedule = await Schedule.findOne({ scheduleDateTime: scheduleDateTime, sportevent: sportevent });
        
    if(existingSchedule) {
       return res.status(400).json({ error: 'SportEvent Schedule Date and Time already exist' });
    }
    
    if(!existingSportEvent) {
       return res.status(404).json({ error: 'SportEvent ID not found in existing SportEvents' });
    }

    const existingDepartment1 = await Department.findOne({ _id: department1 });
    const existingDepartment2 = await Department.findOne({ _id: department2 });

    if(!existingDepartment1 || !existingDepartment2) {
       return res.status(400).json({ error: 'Department ID(s) not found' });
    } 

    if (existingDepartment1._id.toString() === existingDepartment2._id.toString()) {
        return res.status(400).json({ error: 'The Schedule for opponent should not be the same' });
    }
    
    const schedule = await Schedule.create({
        scheduleDateTime,
        sportevent: existingSportEvent._id,
        department1: existingDepartment1._id,
        department2: existingDepartment2._id
    });
    res.status(201).json({ schedule });
});

const getSchedule = asyncHandler(async (req, res) => {
    const { id: scheduleID } = req.params;
    const schedule = await Schedule.findOne({ _id: scheduleID })
    .populate('sportevent').populate('department1').populate('department2');
    const match = await Match.find({ schedule: scheduleID })
    .populate('schedule')
    .populate('winner')
    .populate('loser');
    if(!schedule) {
        return res.status(404).res.send({ msg: `No Schedule with the id : ${scheduleID}`});
    }
    res.status(201).json({ schedule, match });
});

const updateSchedule = asyncHandler(async (req, res) => {
    const { id: scheduleID } = req.params;

    const existingSchedule = await Schedule.findById(scheduleID);
    const schedDateTime = new Date(req.body.scheduleDateTime);

    if (schedDateTime.getTime() !== existingSchedule.scheduleDateTime.getTime() || req.body.sportevent !== existingSchedule.sportevent.toString()) {
        const existingSportEventInSchedule = await Schedule.findOne({ sportevent: req.body.sportevent });
        const existingScheduleTime = await Schedule.findOne({ scheduleDateTime: req.body.scheduleDateTime });

        if (existingScheduleTime && existingSportEventInSchedule) {
            return res.status(400).json({ error: 'SportEvent Schedule Date and Time already exist' });
        }
    }

    // Check if the sport event is "swimming" or "running"
    const existingSportEvent = await SportEvent.findOne({ _id: req.body.sportevent });
    const isSwimmingOrRunningEvent = /(swimming|running)/i.test(existingSportEvent.name);
    
    if (isSwimmingOrRunningEvent) {
        const schedule = await Schedule.findOneAndUpdate({ _id: scheduleID }, req.body, {
            new: true,
            runValidators: true,
            overwrite: true,
        });

        if (!schedule) {
            return res.status(404).send({ msg: `No Schedule with the id: ${scheduleID}` });
        }

        return res.status(201).json({ schedule });
    }

    // Continue with validation for department1 and department2
    const existingDepartment1 = await Department.findOne({ _id: req.body.department1 });
    const existingDepartment2 = await Department.findOne({ _id: req.body.department2 });

    if (!existingDepartment1 || !existingDepartment2) {
        return res.status(400).json({ error: 'Department ID(s) not found' });
    }

    if (existingDepartment1._id.toString() === existingDepartment2._id.toString()) {
        return res.status(400).json({ error: 'The Schedule for opponent should not be the same' });
    }

    const schedule = await Schedule.findOneAndUpdate({ _id: scheduleID }, req.body, {
        new: true,
        runValidators: true,
        overwrite: true,
    });

    if (!schedule) {
        return res.status(404).send({ msg: `No Schedule with the id: ${scheduleID}` });
    }

    res.status(201).json({ schedule });
});

// const updateSchedule = asyncHandler(async (req, res) => {
//     const { id: scheduleID } = req.params;
    
//     const existingDepartment1 = await Department.findOne({ _id: req.body.department1 });
//     const existingDepartment2 = await Department.findOne({ _id: req.body.department2 });

//     if(!existingDepartment1 || !existingDepartment2) {
//         return res.status(400).json({ error: 'Department ID(s) not found' });
//     }

//     if (existingDepartment1._id.toString() === existingDepartment2._id.toString()) {
//         return res.status(400).json({ error: 'The Schedule for opponent should not be the same' });
//     }

//     const existingSchedule = await Schedule.findById(scheduleID);
//     const schedDateTime = new Date(req.body.scheduleDateTime);
    
//     if (schedDateTime.getTime() !== existingSchedule.scheduleDateTime.getTime() || req.body.sportevent !== existingSchedule.sportevent.toString()) {
//         const existingSportEventInSchedule = await Schedule.findOne({ sportevent: req.body.sportevent });
//         const existingScheduleTime = await Schedule.findOne({ scheduleDateTime: req.body.scheduleDateTime });
        
//     if(existingScheduleTime && existingSportEventInSchedule) {
//         return res.status(400).json({ error: 'SportEvent Schedule Date and Time already exist' });
//       }  
//     }
    
//     const schedule = await Schedule.findOneAndUpdate({ _id: scheduleID }, req.body, {
//         new: true,
//         runValidators: true,
//         overwrite: true,
//     });
//     if(!schedule) {
//         return res.status(404).send({ msg: `No Schedule with the id : ${scheduleID}`});
//     }
//     res.status(201).json({ schedule });
// });  

const deleteSchedule = asyncHandler(async (req, res) => {
    const { id: scheduleID } = req.params;
    const schedule = await Schedule.findOneAndDelete({ _id: scheduleID });
    if(!schedule) {
        return res.status(404).send({ msg: `No Schedule with the id : ${scheduleID}`});
    }
    // delete associated matches referencing the Schedule id
    await Match.deleteMany({ schedule: scheduleID });
    res.status(201).json({ schedule });
});


module.exports = {
    getAllSchedules, 
    createSchedule, 
    getSchedule,
    updateSchedule,
    deleteSchedule,
}   