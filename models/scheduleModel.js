const mongoose = require('mongoose');

const scheduleSchema = mongoose.Schema({
    //validation
    scheduleDateTime: {
        type: Date,
        required: [true, 'must provide date and time for the schedule'],
    },
    sportevent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SportEvent',
        required: [true, 'must provide a SportEvent in Schedule'],
    },
    department1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
    },
    department2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
    },
});

const Schedule = mongoose.model('Schedule', scheduleSchema);

module.exports = Schedule;
