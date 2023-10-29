const Department = require('../models/departmentModel');
const asyncHandler = require('express-async-handler');

const getAllDepartments = asyncHandler(async (req, res) => {
    const department = await Department.find({}); // retrive all department data
    res.status(200).json({ department });
});

const createDepartment = asyncHandler(async (req, res) => {
    const { name } = req.body;
    const existingDepartment = await Department.findOne({ name: name });
    if(existingDepartment) {
        return res.status(400).json({ error: 'Department is already exist'});
    }
    const department = await Department.create({ name });
    res.status(201).json({ department });
});

const getDepartment = asyncHandler(async (req, res) => {
    const { id: departmentID } = req.params;
    const department = await Department.findOne({ _id: departmentID });
    if(!department){
       return res.status(404).json({ msg: `No Department with the id : ${departmentID}`});
    }
    res.status(200).json({ department });
});

const updateDepartment = asyncHandler(async (req, res) => { 
    const { id: departmentID } = req.params;
    const department = await Department.findOneAndUpdate({ _id: departmentID }, req.body, {
        new: true,
        runValidators: true,
        overwrite: true,
    });
    if(!department) {
        return res.status(404).json({ msg: `No Department with the id : ${departmentID}`});
    }
    res.status(201).json({ department });
});

const deleteDepartment = asyncHandler(async (req, res) => {
    const {id : departmentID } = req.params;
    const department = await Department.findOneAndDelete({ _id: departmentID });
    if(!department) {
        return res.status(404).json({ msg: `No Department with the id: ${departmentID}`})
    }
    res.status(200).json({ department })
});


module.exports = {
    getAllDepartments,
    createDepartment,
    getDepartment,
    updateDepartment,
    deleteDepartment,
}