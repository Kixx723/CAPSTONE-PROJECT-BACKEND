const mongoose = require('mongoose');


const userSchema = mongoose.Schema({
    //validation
    firstname: {
        type: String,
        required: [true, 'user must have a first name'],
    },
    lastname: {
        type: String,
        required: [true, 'user must have last name'],
    },
    username: {
        type: String,
        required: [true, 'user must have a username'],
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'user must have a password'],
    },
    role: {
        type: String,
        enum: ['admin', 'ssc'],
        default: 'ssc',
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;