const jwt = require('jsonwebtoken');
const User = require('../models/userModel');


// this middleware will protect the api routes
const requireAuth = async (req, res, next) => {
    //verify authentication
    const { authorization } = req.headers

    if (!authorization) {
        return res.status(401).json({ error: 'Authorization token required' })
    }

    const token = authorization.split(' ')[1] //position 1 was the token

    try {
       const { _id } = jwt.verify(token, process.env.SECRET);

       req.user = await User.findOne({ _id }).select('_id'); //select _id will not return the user firstname or username and hashpassword
       next();

    } catch (error) {
        console.log(error)
        res.status(401).json({ error: 'Request is not authorized' });
    }

}

module.exports = requireAuth;