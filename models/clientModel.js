const mongoose = require('mongoose');
const validator = require('validator');
const createError = require('http-errors');
const validate = require('../utils/message.json');

const clientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, validate.error.name],
        trim: true,
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
    },
    manager: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Manager',
        },
    ],
    email: {
        type: String,
        required: [true, validate.error.email],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, validate.error.emailInvalid],
    },
    phone: {
        type: String,
        required: [true, validate.error.phone],
        unique: true,
    },

    businessName: String,
    businessRegistrationType: String,
    businessCategory: String,
    businessWebsite: String,
    businessPhone: String,
    businessEmail: String,
    businessAddress: String,
    businessCity: String,
    businessState: String,
    businessCountry: String,
    businessPincode: String,

    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active',
    },
    date: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false, select: false },
});

module.exports = new mongoose.model('Client', clientSchema);
