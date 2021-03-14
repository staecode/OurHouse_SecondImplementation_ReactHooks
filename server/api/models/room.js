// define model for room for mongoose

const mongoose = require('mongoose');
const User = require('./user');

//create layout of object
const roomSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId, //internal mongoose type
    name: { type: String, required: true},
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    create_date: {type: Date, default: Date.now}
});

// think of model like a provided constructor to build these objects (based on schema layout)
// parms: internal name to refer to model, schema name to create new objects of model
module.exports = mongoose.model('Room', roomSchema);