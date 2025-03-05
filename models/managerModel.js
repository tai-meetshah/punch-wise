const mongoose = require('mongoose');
const validator = require('validator');
const createError = require('http-errors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const validate = require('../utils/message.json');

const managerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, validate.error.name],
        trim: true,
    },
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
    dob: {
        type: String,
    },
    gender: {
        type: String,
    },
    address: {
        type: String,
    },
    city: {
        type: String,
    },
    state: {
        type: String,
    },

    idProof: {
        type: String,
    },
    certificate: {
        type: String,
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Company',
    },
    joiningDate: String,

    paymentType: String,
    monthlySalary: String,
    overtimeCharges: String,

    shiftType: String,
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

    photo: { type: String, default: '/uploads/default_user.jpg' },
    password: {
        type: String,
        required: [
            function () {
                return !this.googleId && !this.facebookId && !this.appleId;
            },
            validate.error.password,
        ],
        minlength: [6, validate.error.passwordLength],
        trim: true,
        select: false,
    },
    fcmToken: { type: String, required: [true, validate.error.fcmToken] },
    blocked: {
        type: Boolean,
        default: false,
        select: false,
        immutable: true,
    },

    googleId: String,
    facebookId: String,
    appleId: String,

    date: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false, select: false },
});

// Generating tokens
managerSchema.methods.generateAuthToken = function () {
    try {
        return jwt.sign({ _id: this._id.toString() }, process.env.JWT_SECRET, {
            expiresIn: '90d',
        });
    } catch (error) {
        throw createError.BadRequest(error);
    }
};

// Converting password into hash
managerSchema.post('validate', async function (doc) {
    if (doc.isModified('password')) {
        if (doc.password) doc.password = await bcrypt.hash(doc.password, 10);
    }
});

// check password
managerSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

module.exports = new mongoose.model('Manager', managerSchema);
