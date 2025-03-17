const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema({
    company: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Company',
    },

    date: { type: String, required: true },
    name: { type: String, required: true },

    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = new mongoose.model('Holiday', holidaySchema);
