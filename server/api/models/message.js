// define model for message for mongoose

const mongoose = require('mongoose');
const Room = require('./room');
const User = require('./user');

//create layout of object
const messageSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId, //internal mongoose type
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    create_time: {type : Date, default: Date.now},
    body: {type: String, required: true}
});

// think of model like a provided constructor to build these objects (based on schema layout)
// parms: internal name to refer to model, schema name to create new objects of model
module.exports = mongoose.model('Message', messageSchema);