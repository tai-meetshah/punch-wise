const mongoose = require('mongoose');
const validator = require('validator');
const createError = require('http-errors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validate = require('../utils/message.json');

const adminSchema = new mongoose.Schema({
    name: { type: String, trim: true },
    email: {
        type: String,
        required: [true, validate.error.email],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, validate.error.emailInvalid],
    },
    photo: { type: String, default: '/uploads/default_user.jpg' },
    password: {
        type: String,
        required: [true, validate.error.password],
        minlength: [8, validate.error.passwordLength8Char],
    },
    passwordConfirm: {
        type: String,
        required: [true, validate.error.confirmPassword],
        validate: {
            // This only works on CREATE and SAVE!!!
            validator: function (el) {
                return el === this.password;
            },
            message: validate.error.passwordNotMatch,
        },
    },
});

// Generate auth token
adminSchema.methods.generateAuthToken = async function () {
    try {
        return jwt.sign({ _id: this._id.toString() }, process.env.JWT_SECRET, {
            expiresIn: '90d',
        });
    } catch (error) {
        throw createError.BadRequest(error);
    }
};

adminSchema.pre('save', async function (next) {
    // Only run this function if password was actually modified
    if (!this.isModified('password')) return next();

    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    // Delete passwordConfirm field
    this.passwordConfirm = undefined;
    next();
});

adminSchema.methods.correctPassword = async function (
    candidatePassword,
    adminPassword
) {
    return await bcrypt.compare(candidatePassword, adminPassword);
};

module.exports = new mongoose.model('Admin', adminSchema);
