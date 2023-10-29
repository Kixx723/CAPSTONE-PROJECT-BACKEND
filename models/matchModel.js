const mongoose = require('mongoose');

const matchSchema = mongoose.Schema({
    //validation
    schedule: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Schedule',
        required: [true, 'must provide a schedule reference id for the match'],
    },
    winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: [true, 'must provide a department id for the winner'],
    },
    loser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: [true, 'must provide a department id for the loser'],
    },    
});

const Match = mongoose.model('Match', matchSchema);

module.exports = Match;
