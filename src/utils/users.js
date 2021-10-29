const users = [];

const addUser = ({ id, username, room }) => {
    username = username.trim();
    room = room.trim();

    if (!username || !room) {
        return {
            error: 'Username and room are required!',
        };
    }

    const isUserExistInSameRoom = users.some(user => username === user.username && room === user.room);

    if (isUserExistInSameRoom) {
        return {
            error: 'Username is in use',
        };
    }

    const user = {
        id,
        username,
        room: {
            displayName: room,
            name: room.toLowerCase()
        }
    };

    users.push(user);

    return { user };
};

const removeUser = (id) => {
    const index = users.findIndex(user => user.id === id);

    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
};


const getUser = (id) => {
    return users.find(user => user.id === id);
};

const getUsersInRoom = (roomName) => {
    roomName = roomName.trim().toLowerCase();

    return users.filter(user => user.room.name === roomName);
};

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
};