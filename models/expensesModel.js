const mongoose = require('mongoose');

const expensesSchema = new mongoose.Schema({
    salesman: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Salesman',
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
    expensesFor: { type: String, required: true },
    amount: { type: String, required: true },
    description: { type: String, required: true },
    receipt: { type: String, required: true },

    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = new mongoose.model('Holiday', expensesSchema);
