const mongoose = require('mongoose');
const validator = require('validator');
const createError = require('http-errors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const validate = require('../utils/message.json');

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, validate.error.name],
        trim: true,
    },
    salesman: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Salesman',
        },
    ],
    manager: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Manager',
        },
    ],
    client: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Client',
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
    dob: {
        type: String,
    },
    gender: {
        type: String,
    },
    address: {
        type: String,
        trim: true,
    },
    city: {
        type: String,
    },
    state: {
        type: String,
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

    googleId: String,
    facebookId: String,
    appleId: String,
    fcmToken: { type: String, required: [true, validate.error.fcmToken] },

    blocked: { type: Boolean, default: false, select: false, immutable: true },
    date: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false, select: false },
});

// Generating tokens
companySchema.methods.generateAuthToken = function () {
    try {
        return jwt.sign({ _id: this._id.toString() }, process.env.JWT_SECRET, {
            expiresIn: '90d',
        });
    } catch (error) {
        throw createError.BadRequest(error);
    }
};

// Converting password into hash
companySchema.post('validate', async function (doc) {
    if (doc.isModified('password')) {
        if (doc.password) doc.password = await bcrypt.hash(doc.password, 10);
    }
});

// check password
companySchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

module.exports = new mongoose.model('Company', companySchema);
