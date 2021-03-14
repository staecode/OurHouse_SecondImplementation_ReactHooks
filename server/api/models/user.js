// define model for user for mongoose

const mongoose = require('mongoose');
const Room = require('./room');

//create layout of object
const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId, //internal mongoose type
    name: { type: String, required: true},
    handle: { 
        type: String, 
        required: true, 
        // unique optimizes (as searchable, indexed etc)
        // but does not provide validation
        createIndexes: true
    },
    password: { type: String, required: true},
    rooms: [{type: mongoose.Schema.Types.ObjectId, ref: 'Room'}]
});

// think of model like a provided constructor to build these objects (based on schema layout)
// parms: internal name to refer to model, schema name to create new objects of model
module.exports = mongoose.model('User', userSchema);