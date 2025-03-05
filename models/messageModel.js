const mongoose = require('mongoose');
const validator = require('validator');
const validation = require('../utils/message.json');

const messageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, validation.error.name],
        trim: true,
    },
    email: {
        type: String,
        required: [true, validation.error.email],
        lowercase: true,
        validate: [validator.isEmail, validation.error.emailInvalid],
    },
    comments: {
        type: String,
        required: [true, validation.error.comments],
        trim: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

module.exports.SalesmanMessage = mongoose.model(
    'SalesmanMessage',
    messageSchema
);

module.exports.ManagerMessage = mongoose.model('ManagerMessage', messageSchema);

module.exports.CompanyMessage = mongoose.model('CompanyMessage', messageSchema);
