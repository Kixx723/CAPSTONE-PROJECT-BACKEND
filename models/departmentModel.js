const mongoose = require('mongoose');

const departmentSchema = mongoose.Schema({
    //validation
    name: {
        type: String,
        required: [true, 'must provide a department name'],
    },
});


const Department = mongoose.model('Department', departmentSchema);

module.exports = Department;
