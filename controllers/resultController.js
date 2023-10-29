const Result = require('../models/resultModel');
const SportEvent = require('../models/sportEventModel');
const Department = require('../models/departmentModel');
const asyncHandler = require('express-async-handler');


const getAllResults = asyncHandler(async (req, res) => {
    const result = await Result.find({}).populate({ path : 'sportevent', populate: [
        { path: 'name' }, { path: 'event' }, 
    ]})
    .populate('gold silver bronze', 'name');
    res.status(200).json({ result });
});

const createResult = asyncHandler(async (req, res) => {
    const { sportevent, gold , silver, bronze } = req.body;
    const existingResult = await Result.findOne({ sportevent: sportevent });
    const existingSportEvent = await SportEvent.findOne({ _id: sportevent });
    const departmentGold = await Department.findOne({ _id: gold });
    const departmentSilver = await Department.findOne({ _id: silver });
    const departmentBronze = await Department.findOne({ _id: bronze });

    if(departmentGold.toString() === departmentSilver.toString() || 
       departmentGold.toString() === departmentBronze.toString() ||
       departmentSilver.toString() === departmentBronze.toString()) {
        return res.status(400).json({ error: 'Gold silver or bronze should not the same Department in every sportevent' });
    }
    
    if(existingResult) {
        return res.status(400).json({ error: 'Result is already Exist' });
    }

    if(!existingSportEvent) {
        return res.status(404).json({ error: 'SportEvent ID not found in existing SportEvents' });
    } 

    const result = await Result.create({
        sportevent,
        gold,
        silver,
        bronze, 
    });
    res.status(200).json({ result });
});

const getResult = asyncHandler(async (req, res) => {
    const { id: resultID } = req.params;
    const result = await Result.findOne({ _id: resultID })
    .populate({ path : 'sportevent', populate: [
        { path: 'name' }, { path: 'event' }, 
    ]})
    .populate('gold').populate('silver').populate('bronze');
    if(!result) {
        return res.status(404).send({ msg: `No Result with the id : ${resultID}`});
    }
    res.status(200).json({ result });
});

const updateResult = asyncHandler(async (req, res) => {
    const { id: resultID } = req.params;
    const existingSportEvent = await SportEvent.findOne({ _id: req.body.sportevent });
    const departmentGold = await Department.findOne({ _id: req.body.gold });
    const departmentSilver = await Department.findOne({ _id: req.body.silver });
    const departmentBronze = await Department.findOne({ _id: req.body.bronze });
    
    if(departmentGold.toString() === departmentSilver.toString() || 
       departmentGold.toString() === departmentBronze.toString() ||
       departmentSilver.toString() === departmentBronze.toString()) {
        return res.status(400).json({ error: 'Gold silver or bronze should not the same Department in every sportevent' });
    }

    if(!existingSportEvent) {
        return res.status(404).json({ error: 'SportEvent ID not found in existing SportEvents' });
    }

    const result = await Result.findOneAndUpdate({ _id: resultID }, req.body, {
        new: true,
        runValidators: true,
        overwrite: true,
    });

    if(!result) {
        return res.status(404).send({ msg: `No Result with the id : ${resultID}`});
    }
    res.status(200).json({ result });
});

const deleteResult = asyncHandler(async (req, res) => {
    const { id: resultID } = req.params;
    const result = await Result.findOneAndDelete({ _id: resultID });
    if(!result) {
        return res.status(404).send({ msg: `No Result with the id : ${resultID}`});
    }
    res.status(200).json({ result });
});


module.exports = {
    getAllResults,
    createResult,
    getResult,
    updateResult,
    deleteResult,
}