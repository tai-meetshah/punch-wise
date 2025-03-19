const mongoose = require('mongoose');

const expensesSchema = new mongoose.Schema({
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Manager',
        required: true,
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
    },

    date: { type: Date, required: true },
    expensesFor: { type: String, required: true },
    amount: { type: String, required: true },
    description: { type: String, required: true },
    receipt: { type: String, required: true },

    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
        default: 'Pending',
    },
    rejectReason: { type: String },

    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = new mongoose.model('Manager Expenses', expensesSchema);
