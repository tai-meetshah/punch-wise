const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    senderType: {
        type: String,
        enum: ['Salesman', 'Manager', 'Company'],
        required: true,
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    receiverType: {
        type: String,
        enum: ['Salesman', 'Manager', 'Company'],
        required: true,
    },
    message: {
        type: String,
        required: true,
        trim: true,
    },
    file: { type: String },

    //! in readby Salesman manager any come
    readBy: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId },
            userType: {
                type: String,
                enum: ['Salesman', 'Manager', 'Company'],
            },
        },
    ],
    deletedBy: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId },
            userType: {
                type: String,
                enum: ['Salesman', 'Manager', 'Company'],
            },
        },
    ],
    date: {
        type: Date,
        default: Date.now,
    },
});

module.exports = new mongoose.model('Chat', chatSchema);
