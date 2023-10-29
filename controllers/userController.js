const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');
const { hashPassword, comparePassword } = require('../utils/helpers');
const jwt = require('jsonwebtoken');

//inside in sign method passing 3 arguments first is the payload with the _id property
// second is the secret and the third argument is the option that expires the token
const createToken = (_id) => {
    return jwt.sign({_id}, process.env.SECRET, { expiresIn: '3d' });
}

const loginUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username: username });
    
    if(!user) {
        return res.status(400).json({ success: false, message: 'Incorrect username or password'});
    }

    const match = comparePassword(password, user.password); // comparing the raw and hashed password

    if(!match) {
        return res.status(400).json({ success: false, message: 'Incorrect username or password'});
    }
    
    //create a token
    const token = createToken(user._id);
    
    res.status(200).json({ success: true, id: user._id, firstname: user.firstname, lastname: user.lastname, role: user.role, token });
});

const getAllUsers = asyncHandler(async (req, res) => {
    const user = await User.find({}); // retrieve all the users in the database;
    res.status(200).json({ user }); 
});

const registerUser = asyncHandler(async (req, res) => {
    const { firstname, lastname, username, password, confirmPassword , role } = req.body; 
    const existingUsername = await User.findOne({ username: username });
        
    if(existingUsername) {
        return res.status(400).json({ error: 'User is already exist' });
    }

    if(password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    if(password !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match' });
    }

    if(role !== 'admin' && role !== 'ssc') {
        return res.status(400).json({ error: 'Invalid role' });
    }

    const userPassword = hashPassword(password); // hashing the password of user when registration
    
    const user = await User.create({ 
        firstname, 
        lastname, 
        username, 
        password: userPassword, 
        role,
    }); 

    //create a token
    const token = createToken(user._id);
    
    res.status(200).json({ success: true, user: {firstname, lastname, username, role}, token }); 
});

const getUser = asyncHandler(async (req, res) => {
    const { id: userID } = req.params;
    const user = await User.findOne({ _id: userID });
    if(!user) {
        return res.status(404).json({ msg: `No User with the id : ${userID}` });
    }
    res.status(200).json({ user });
});

const updateUser = asyncHandler(async (req, res) => {
    const { id: userID } = req.params;

    const existingUser = User.findOne({ id: userID });

    if (req.body.username !== existingUser.username) {
        const existingUsername = await User.findOne({ username: req.body.username });
        
        if (existingUsername) {
          return res.status(400).json({ error: 'Username already exists' });
        }
      }

    const user = await User.findOneAndUpdate({ _id: userID }, req.body, {
        new: true,
        runValidators: true,
        overwrite: true,
    });
    if(!user) {
        return res.status(404).json({ msg: `No User with the id : ${userID}` });
    }
    res.status(201).json({ user });
});


const deleteUser = asyncHandler(async (req, res) => {
    const { id: userID } = req.params;
    const user = await User.findByIdAndDelete({ _id: userID });
    if(!user) {
        return res.status(404).json({ msg: `No User with the id : ${userID}` });
    }
    res.status(200).json({ user });
});

const changePassword = asyncHandler(async (req, res) => {
    const { id: userID } = req.params;
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(userID);

    if (!user) {
        return res.status(404).json({ msg: `No User with the id: ${userID}` });
    }

    // gina Check kung ang old password kay naga match sa stored hashed password
    const isPasswordValid = comparePassword(oldPassword, user.password);

    if (!isPasswordValid) {
        return res.status(400).json({ error: 'Incorrect old password' });
    }

    // gina validate ang new password 
    if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    // Hash the new password
    const hashedNewPassword = hashPassword(newPassword);

    // Update ang user's password sa database
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password changes successfully' });
});


module.exports = {
    getAllUsers,
    loginUser,
    registerUser,
    getUser,
    updateUser,
    deleteUser,
    changePassword,
}