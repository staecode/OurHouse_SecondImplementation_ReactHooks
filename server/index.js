
const express = require('express'); // package added via npm
const morgan = require('morgan'); // logging
const bodyParser = require('body-parser'); // parse requests - url encoded or json
const mongoose = require('mongoose'); // database interface tool
const socketio = require('socket.io')
const http = require('http');


const { addUser, removeUser, getUser, getUsersInRoom } = require('./users');

const PORT = process.env.PORT || 5000

const app = express();
app.use((req, res, next) => {
    // set header to append access header to all responses
    res.header('Access-Control-Allow-Origin', '*');
    // set header permissions
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Headers, Access-Control-Request-Method, Access-Control-Request-Headers');
    // give option answer to browser
    if(req.method === 'OPTIONS') {
        res.header('Acess-Control-Allow-Methods', 'GET, PUT, POST, PATCH, DELETE');
        res.status(200).json({});
    }
    // move on
    next();
})
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// express router
const userRoutes = require('./api/routes/users');
const roomRoutes = require('./api/routes/rooms');
const messageRoutes = require('./api/routes/messages');

app.use('/users', userRoutes);
app.use('/rooms', roomRoutes);
app.use('/messages', messageRoutes);

process.on('warning', (warning) => {
    console.warn(warning.name);    // Print the warning name
    console.warn(warning.message); // Print the warning message
    console.warn(warning.stack);   // Print the stack trace
});

mongoose.connect(
    'mongodb+srv://Staecode:' + 
    process.env.MONGO_ATLAS_PW + 
    '@cluster0.nmmfj.mongodb.net/<dbname>?retryWrites=true&w=majority',
    { useNewUrlParser: true, useUnifiedTopology: true }
);

app.use((req, res, next)=> {
    // create error object
    const error = new Error('Not Found');
    error.status = 404;
    // pass error along to next handle
    next(error);
});
// 600 errors will reach this error
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

const server = http.createServer(app);
//instance of socket io
const io = socketio(server);

//socket manager
io.on('connection', (socket) => {
    console.log('New user has entered the chat.');

    socket.on('join', ({ handle, room, roomName }, callback) => {
        const { error, user }  = addUser({ id: socket.id, handle, room, roomName });

        //if(error) return callback(error);

        if(user.handle != '') {
            socket.emit('message', { user: 'admin', text: `${user.handle}, welcome to the room ${user.roomName}`});
        }

        console.log(user);

        socket.broadcast.to(user.room).emit('message', {user: 'admin', text: `${user.handle}, has joined the chat.`});  

        socket.join(user.room);

        io.to(user.room).emit('roomData', {room: user.room, users: getUsersInRoom(user.room)});

        callback();
    });

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        console.log(socket.id);
        console.log(user);
        io.to(user.room).emit('roomData', {room: user.room, users: getUsersInRoom(user.room)});
        io.to(user.room).emit('message', {user: user.handle, text: message});

        callback();
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if(user) {
            io.to(user.room).emit('roomData', {room: user.room, users: getUsersInRoom(user.room)});
            io.to(user.room).emit('message', {user: 'admin', text: `${user.handle} has left the chat.` }); 
        }

        console.log('User has left chat.');
    })
});


server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));
