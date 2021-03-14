// controller file for Message model
const mongoose = require('mongoose');
const Room = require('../models/room');
const User = require('../models/user');
const Message = require('../models/message');


exports.messages_get_all_in_room = (req, res, next) => {
    const id = req.params.roomId;
    Message.find({room: id})
    .exec()
    .then(docs => {
        const resopnse = {
            count: docs.length,
            messages: docs.map( doc => {
                return {
                    _id: doc._id,
                    author: doc.author,
                    time: doc.create_time,
                    body: doc.body
                }
            })
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};

exports.messages_add_in_room = (req, res, next) => {
    const roomId = req.body.roomId;
    const userId = req.body.userId;
    Room.findById(roomId)
    .then(room => {
        if(!room) {
            return res.status(404).json({
                message: "Room not found, cannot add message"
            });
        } else {
            const message = new Message ({
                _id: new mongoose.Types.ObjectId(),
                author: userId,
                room: room._id,
                body: req.body.body
            })
        };
        message.save();
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err})
    });
};

exports.messages_remove_one = (req, res, next) => {
    const messId = req.body.messageId;
    Message.findById(messId)
    .exec()
    .then(message => {
        if(message) {
            Message.remove({_id: messId})
            .exec()
            .then(result => {
                res.status(200).json(result);
            })
            .catch(err => {
                res.status(500).json({
                    error: err
                });
            });
        } else {
            res.status(404).json({message: 'Message not found (by id)'});
        }
    })
    
};

// exports.messages_clear_room = (req, res, next) => {
    
// };