const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    //validation
    name: {
        type: String,
        required: [true, 'must provide a event name'],
        // trim: true - it will cut the spaces on the string
        maxlength: [80, 'event name can not be more than 80 characters'], // the maximum length of the string name
    },
    startDate: {
        type: Date,
        required: [true, 'must provide a start date for the event'],
    },
    endDate: {
        type: Date,
        required: [true, 'must provide a end date for the event'],
    },
    image: {
        type: String,
    },
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
