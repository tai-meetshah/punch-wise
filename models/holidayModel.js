const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema({
    company: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Company',
    },
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Manager',
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
    },
    date: { type: String, required: true },
    name: { type: String, required: true },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
        default: 'Pending',
    },
    rejectReason: { type: Strings },

    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = new mongoose.model('Holiday', holidaySchema);
