const generateMessage = (text, username = 'System') => ({
    text,
    username,
    createdAt: Date.now()
});

const generateLocationMessage = ({ latitude, longitude }, username) => ({
    url: `https://www.google.com/maps?q=${latitude},${longitude}`,
    createdAt: Date.now(),
    username,
});

module.exports = {
    generateMessage,
    generateLocationMessage,
};