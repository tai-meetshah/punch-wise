const mongoose = require('mongoose');
const dotenv = require('dotenv');
const socketIO = require('socket.io');
const socketHandler = require('./utils/socketHandler');

process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(err);
    process.exit(1);
});

dotenv.config();
const app = require('./app');

const DB = process.env.DATABASE.replace(
    '<password>',
    process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => console.log('DB connection successful!'));

// Socket.IO integration
const server = require('http').createServer(app);
global.io = socketIO(server);

socketHandler(io);

const port = process.env.PORT || 4000;
server.listen(port, () => {
    console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err);
    server.close(() => process.exit(1));
});

process.on('SIGTERM', err => {
    console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
    server.close(err => {
        if (err) {
            console.error('Error while closing server: ', err);
        } else {
            console.log('💥 Process terminated!');
        }
    });
});
