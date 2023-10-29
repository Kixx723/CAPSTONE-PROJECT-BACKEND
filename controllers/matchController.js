const Match = require('../models/matchModel');
const Department = require('../models/departmentModel');
const Schedule = require('../models/scheduleModel');
const asyncHandler = require('express-async-handler');


const getAllMatches = asyncHandler(async (req, res) => {
    const match = await Match.find({})
    .populate({ path: 'schedule', populate: [
        { path : 'sportevent' }, { path : 'department1' }, { path : 'department2' }
    ]})
    .populate('winner')
    .populate('loser');
    res.status(201).json({ match });
});

const createMatch = asyncHandler(async (req, res) => {
    const { schedule, winner, loser } = req.body;
    const existingSchedule = await Schedule.findOne({ _id : schedule });
    const existingMatchWinnerInSchedule = await Match.findOne({ schedule: schedule });
    const existingMatchLoserInSchedule = await Match.findOne({ schedule: schedule });
    
    if(existingSchedule && existingMatchWinnerInSchedule && existingMatchLoserInSchedule) { 
        return res.status(400).json({ error: 'Match Schedule Winner and Loser is already exist' });
    }
    
    if(!existingSchedule) {
        return res.status(400).json({ error: 'Invalid Schedule ID' });
    }
    const existingDepartment1 = await Department.findOne({ _id: existingSchedule.department1 });
    const existingDepartment2 = await Department.findOne({ _id: existingSchedule.department2 });


    if (!existingDepartment1 || !existingDepartment2) {
        return res.status(404).json({ error: 'Department(s) not found in the provided Schedule' });
    }

    if (winner !== existingDepartment1._id.toString() && winner !== existingDepartment2._id.toString() ||
        loser !== existingDepartment1._id.toString() && loser !== existingDepartment2._id.toString() ||
        winner === loser) {
        return res.status(404).json({ error: 'Winner and Loser Department should not be the same!' });
    }

    const match = await Match.create({
        schedule: existingSchedule._id,
        winner,
        loser,
    });
    res.status(201).json({ match });
});

const getMatch = asyncHandler(async (req, res) => {
    const { id: matchID } = req.params;
    const match = await Match.findOne({ _id: matchID })
    .populate({ path: 'schedule', populate: [
        { path : 'sportevent' }, { path : 'department1' }, { path : 'department2' }
    ]})
    .populate('winner')
    .populate('loser');
    if(!match) {
        return res.status(404).send({ msg: `No match with the id: ${matchID}`});
    }
    res.status(201).json({ match });
});

const updateMatch = asyncHandler(async (req, res) => {
    const { id: matchID } = req.params;
    const existingSchedule = await Schedule.findOne({ _id : req.body.schedule });
    const existingDepartment1 = await Department.findOne({ _id: existingSchedule.department1 });
    const existingDepartment2 = await Department.findOne({ _id: existingSchedule.department2 });

    if(!existingSchedule) {
        return res.status(404).send({ msg: `No schedule with the id: ${existingSchedule}`});
    }
    
    if (req.body.winner !== existingDepartment1._id.toString() && req.body.winner !== existingDepartment2._id.toString() ||
        req.body.loser !== existingDepartment1._id.toString() && req.body.loser !== existingDepartment2._id.toString() ||
        req.body.winner === req.body.loser) {
        return res.status(400).json({ error: 'Winner and Loser Department should not be the same!' });
    }


    const match = await Match.findOneAndUpdate({ _id: matchID }, req.body, {
        new: true,
        runValidators: true,
        overwrite: true,
    });
    if(!match) {
        return res.status(404).send({ msg: `No match with the id: ${matchID}`});
    }
    res.status(201).json({ match });
});

const deleteMatch = asyncHandler(async (req, res) => {
    const { id : matchID } = req.params;
    const match = await Match.findOneAndDelete({ _id: matchID });
    if(!match) {
       return res.status(404).send({ msg: `No match with the id: ${matchID}`});
    }
    res.status(201).json({ match });
});

module.exports = {
    getAllMatches,
    createMatch,
    getMatch,
    updateMatch,
    deleteMatch,
}
