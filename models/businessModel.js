const mongoose = require('mongoose');
const createError = require('http-errors');
const validate = require('../utils/message.json');

const workingHoursSchema = new mongoose.Schema({
    from: { type: String, required: true }, // e.g., "09:00"
    to: { type: String, required: true }, // e.g., "18:00"
});

const businessSchema = new mongoose.Schema({
    company: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Company',
    },
    businessName: String,
    businessRegistrationType: String,
    businessCategory: String,

    yearEstablish: String,
    workingDays: [
        {
            type: String,
            enum: [
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
                'Sunday',
            ],
            required: true,
        },
    ],
    workingHours: workingHoursSchema,

    businessWebsite: String,
    businessPhone: String,
    businessAlternatePhone: String,
    businessEmail: String,
    businessAddress: String,
    businessCity: String,
    businessState: String,
    businessCountry: String,
    businessPincode: String,

    businessLogo: String,
    businessSupportDoc: String,
    businessLicense: String,
    businessTin: String,

    date: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false, select: false },
});

module.exports = new mongoose.model('Business', businessSchema);
