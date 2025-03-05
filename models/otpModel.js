const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: { type: String, required: true },
    otp: { type: String, required: true },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300, // sec
    },
});

module.exports.SalesmanOTP = mongoose.model('Salesman OTP', otpSchema);

module.exports.ManagerOTP = mongoose.model('Manager OTP', otpSchema);

module.exports.CompanyOTP = mongoose.model('Company OTP', otpSchema);
