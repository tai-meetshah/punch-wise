const mongoose = require('mongoose');

const salesmanActivitySchema = new mongoose.Schema(
    {
        salesmanId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Salesman',
        },
        date: { type: Date, required: true }, // Store only the date (without time) for grouping
        sessions: [
            {
                checkInTime: { type: Date, required: true },
                checkOutTime: { type: Date, default: null },
                breaks: [
                    {
                        breakTime: { type: Date, required: true },
                        resumeTime: { type: Date, default: null },
                    },
                ],
            },
        ],
        manualEntries: [
            {
                startTime: { type: Date, required: true },
                endTime: { type: Date, required: true },
            },
        ],

        checkInTime: { type: Date, default: null },
        breakTime: { type: Date, default: null },
        resumeTime: { type: Date, default: null },
        checkOutTime: { type: Date, default: null },
        status: {
            type: String,
            enum: ['checked-in', 'on-break', 'working', 'checked-out'],
            default: 'checked-in',
        },
    },
    { timestamps: true }
);

module.exports = new mongoose.model(
    'Salesman Activity',
    salesmanActivitySchema
);
