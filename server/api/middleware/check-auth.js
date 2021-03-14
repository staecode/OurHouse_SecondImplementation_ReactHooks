const jwt = require('jsonwebtoken'); // token creation

// function to check access, to be passed to routes as second
// parm, fist action executed once path is reached
// if we arrive here and there is no token present, we SHOULD fail 
// this will ensure it
module.exports = (req, res, next) => {
    //jwt package responsible for checking incoming token
    // need secret key, token
    // verify both decodes (checks for based 64 encoding)
    // and checks for accuracy, throws error
    try {
        // break off the Bearer convention
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, "" + process.env.JWT_KEY);
        req.userObj = decoded;
        console.log(req.userObj);
        // succeeded, passes to route function
        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({
            message: 'Authentication failed on token'
        });
    }
};