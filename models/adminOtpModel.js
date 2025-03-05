const mongoose = require('mongoose');

const adminOtpSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Admin',
    },
    otp: { type: String, required: true },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300, // sec
    },
});

module.exports = new mongoose.model('Admin OTP', adminOtpSchema);
