const mongoose = require('mongoose');
const createError = require('http-errors');
const validate = require('../utils/message.json');

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
    workingHours: String,
    workingDays: {
        sunday: { type: String, default: 'Closed' },
        monday: { type: String, default: 'Closed' },
        tuesday: { type: String, default: 'Closed' },
        wednesday: { type: String, default: 'Closed' },
        thursday: { type: String, default: 'Closed' },
        friday: { type: String, default: 'Closed' },
        saturday: { type: String, default: 'Closed' },
    },

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
