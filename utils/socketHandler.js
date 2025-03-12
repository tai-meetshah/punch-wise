const jwt = require('jsonwebtoken');

const ChatMessage = require('../models/chatMessageModel');

module.exports = io => {
    io.on('connection', socket => {
        // Join
        socket.on('join', data => {
            try {
                const decoded = jwt.verify(data.token, process.env.JWT_SECRET);
                socket.join(decoded._id);
            } catch (error) {
                console.log('Invalid token in join.', data.token);
            }
        });
    });
};
