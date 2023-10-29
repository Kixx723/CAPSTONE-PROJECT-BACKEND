const mongoose = require('mongoose');

const resultSchema = mongoose.Schema({
    //validation
    sportevent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SportEvent',
        required: [true, 'must provide a SportEvent in Sport Event Result'],
    },
    gold: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: [true, 'must provide a gold medal'],
    },
    silver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: [true, 'must provide a silver medal'],
    },
    bronze: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: [true, 'must provide a bronze medal'],
    },
}); 

const Result = mongoose.model('Result', resultSchema);

module.exports = Result;