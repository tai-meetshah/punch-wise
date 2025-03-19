const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
    salesman: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Salesman',
        required: true,
    },
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Manager',
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
    },
    leaveType: {
        type: String,
        // enum: ['Sick Leave', 'Casual Leave', 'Marriage Leave', 'Annual Leave'],
        required: true,
    },

    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    halfDay: { type: Boolean, default: false },

    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
        default: 'Pending',
    },
    notes: { type: String },
    rejectReason: { type: String },
    requestedOn: { type: Date, default: Date.now },
});

module.exports = new mongoose.model('Salesman Leave', leaveSchema);
