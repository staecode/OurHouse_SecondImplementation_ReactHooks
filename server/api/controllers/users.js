// controller file for user model
const mongoose = require('mongoose');
const Room = require('../models/room');
const User = require('../models/user');
const bcrypt = require('bcrypt'); // password hashing
const jwt = require('jsonwebtoken'); // token creation
const { response } = require('express');

// get all users
exports.users_get_all = (req, res, next) => {
    User.find() // return all of them
    .select('name handle _id rooms password')
    .populate('rooms')
    .exec()
    .then(docs => {
        console.log(docs);
        const response = {
            count: docs.length,
            users: docs.map( doc => {
                return {
                    name: doc.name,
                    handle: doc.handle,
                    _id: doc._id,
                    rooms: doc.rooms,
                    password: doc.password,
                    // where to look next to get more information about each
                    // individual document
                    request: {
                        type: 'GET',
                        description: 'link to user object',
                        url: 'http://localhost:3000/users/' + doc._id
                    }
                }
            })
        };
        res.status(200).json({response});      
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};

// sign user in to system, provide token
exports.users_sign_in = (req, res, next) => {
    User.find({handle: req.body.handle}) 
    .exec()
    .then(user => { // empty or one user 'array'
        if(user.length < 1) {
            return res.status(401).json({
                message: 'Authentication Failed'
            });
        }
        // compare coming in plain text to stored
        // have to use bcrypt compare because it knows the algorithm
        // for hashing
        bcrypt.compare(req.body.password, user[0].password, (err, result) => {
            if(err) {
                return res.status(401).json({
                    message: 'Authentication Failed'
                });
            } 
            if(result) {
                //build element of my json web token
                const token = jwt.sign(
                    {
                        handle: user[0].handle,
                        userId: user[0]._id
                    }, 
                    "" + process.env.JWT_KEY, 
                    {
                        expiresIn: "1h"
                    }
                );
                return res.status(200).json({
                    message: 'Authentication Successful',
                    token: token,
                    user: {
                        handle: user[0].handle,
                        _id: user[0]._id
                    }
                });
            }
            // same error message occurs at all levels so as not to 
            // tell user attempting to log in more information than 
            // necessary about credentials, in case it is malicious
            // (password incorrect lets them know they have a 
            // successful username)
            return res.status(401).json({
                message: 'Authentication Failed'
            });
        })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};

// add user to the system
exports.users_sign_up = (req, res, next) => {
    // first check handle availibility 
    User.find({handle: req.body.handle})
    .exec() // creates promise
    .then(user => {
        if(user.length >= 1) {
            // conflict 409 or unprocessable 422
            return res.status(409).json({
                message: 'User with handle is already in database'
            });
        } else {
            // now start adding
            // hash password with package
            // dictionary tables exist, database access may be able to get
            // access to simple passwords
            // so salting adds extra characters to strings, to break them up
            // and make them non recognizable 
            // (think discrete structures and encryption - the formulas that 
            // encode and decode can be recreated)
            // seconde parm is "salting rounds"
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if(err) {
                    return res.status(500).json({
                        error: err
                    }); 
                } else {
                // get user information
                const user = new User({
                    // auto create unique id
                    _id: new mongoose.Types.ObjectId(),
                    name: req.body.name, 
                    handle: req.body.handle,
                    password: hash,
                    rooms: []
                });
                // save object in database
                    user.save()
                    .then(result => {
                        console.log(result);
                            // 201, successful, resource created
                        res.status(201).json({ 
                        message: 'User ' + result.handle + ' was created!',
                        createdUser: {
                            name: result.name,
                            handle: result.handle,
                            _id: result.id,
                            password: result.password,
                            // provide response that allows domino to next execution
                            request: {
                                type: 'GET',
                                description: 'link to created user',
                                url: 'http://localhost:3000/users/' + result._id
                            }
                        }
                    });
                    })
                    .catch(err => {
                        res.status(500).json({error: err});
                    });            
                }
            });
        }
    })
    .catch(err => {
        res.status(500).json({error:err});
    })
};

// get one user
exports.users_get_one = (req, res, next) => {
    const id = req.params.userId;
    User.findById(id)
    .exec()
    // need to fix, should not display all fields (docs, map etc)
    .then(doc => {
        // write data to response
        console.log(doc);
        if(doc) {
            res.status(200).json({doc});
        } else {
            res.status(404).json({message: 'No valid entry found for provided id'});
        }
    })
    .catch(err => {
        // couldn't get data, respond with error
        console.log(err);
        res.status(500).json({error: err});
    });
};

exports.users_get_friend = (req, res, next) => {
    User.find({handle: req.params.handle})
    .select('handle _id')
    .exec()
    .then(doc => {
        if(doc) {
            const json = JSON.stringify(doc);
            const obj = JSON.parse(json);
            console.log(obj)
                return res.status(200).json({
                    handle: obj.handle,
                    _id: obj._id
                });   
        } else {
            res.status(404).json({message: 'No valid entry found for provided id'});
        }
    })
    .catch(err => {
        // couldn't get data, respond with error
        res.status(500).json({error: err});
    });
};



// update one user
exports.users_patch_one = (req, res, next) => {
    const id = req.params.userId;
    const updateOps = {};
    // build array of value pairs that need updating in database
    // must make body request iterable for this to work
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    User.updateOne({_id: id}, {$set: updateOps})
    .exec()
    .then(result => {
        console.log(result);
        res.status(200).json(result);
    })
    .catch( err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};

// remove one user
exports.users_delete_one = (req, res, next) => {
    const id = req.params.userId;
    User.remove({_id: id})
    .exec()
    .then(result => {
        res.status(200).json(result);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};

// get users list of rooms
exports.users_get_rooms = (req, res, next) => {
    const id = req.params.userId;
    User.findById(id)
    .populate('rooms')
    .exec()
    .then(doc => {
        res.status(200).json({
            roomList: doc.rooms.map( room => {
                return {
                    room: {
                        name: room.name,
                        _id: room._id
                    }
                    /*request: {
                        type: 'GET',
                        description: 'link to room object',
                        url: 'http://localhost:5000/rooms/' + room
                    }*/
                }
            })
        });
    })
    .catch(err => {
        // couldn't get data, respond with error
        console.log(err);
        res.status(500).json({error: err});
    });
};

exports.users_add_room = (req, res, next) => {
    const id = req.params.userId;
    const r_id = req.params.roomId;

    Room.findById(r_id)
        .then(room => {
            User.findById(id)
            .exec()
            .then(doc => {
                if(doc) {
                    User.updateOne({_id: doc._id}, {$push: {rooms: r_id}})
                    .exec()
                    .then(result => {
                        res.status(200).json({
                            message: "Room added to user: " + doc._id,
                            requests: [
                                {
                                    type: 'GET',
                                    description: 'link to created room',
                                    url: 'http://localhost:5000/rooms/' + r_id
                                }
                            ]
                        })
                    })
                    .catch(err_add => {
                        console.log(err_add);
                    })
                }
            })
            .catch(err_user_find => {
                // couldn't get data, respond with error
                 res.status(500).json({error: err_user_find});
            })
        })
        .catch(err_room_find => {
            res.status(500).json({
                message: 'Room not found'
            });
        });
};