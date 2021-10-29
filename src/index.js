const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');
const app = require('./app');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, getUser, removeUser, getUsersInRoom } = require('./utils/users');

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
const io = socketio(server);

io.on('connection', (socket) => {
    console.log('New web socket connection');

    socket.on('join', (data, callback) => {
        const { error, user } = addUser({ id: socket.id, ...data });

        if (error) {
            return callback(error);
        }

        socket.join(user.room.name);

        socket.emit('message', generateMessage('Welcome!'));
        socket.broadcast.to(user.room.name).emit('message', generateMessage(`${user.username} has joined!`));
        io.to(user.room.name).emit('roomData', {
            room: user.room.displayName,
            users: getUsersInRoom(user.room.name),
        });

        callback();
    });

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter();

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!');
        }

        const user = getUser(socket.id);

        if (!user) {
            return callback('User is not defined!');
        }

        io.to(user.room.name).emit('message', generateMessage(message, user.username));
        callback();
    });

    socket.on('sendLocation', (coords, callback) => {
        if (!coords) {
            return callback('Coordinates is not defined!');
        }

        const { latitude, longitude } = coords;
        const user = getUser(socket.id);

        if (!user) {
            return callback('User is not defined!');
        }

        io.to(user.room.name).emit('locationMessage', generateLocationMessage({ latitude, longitude }, user.username));
        callback();
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room.name).emit('message', generateMessage(`${user.username} has left`));
            io.to(user.room.name).emit('roomData', {
                room: user.room.displayName,
                users: getUsersInRoom(user.room.name),
            });
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server is up on port ${PORT}`);
});