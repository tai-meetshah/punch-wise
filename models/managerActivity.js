const mongoose = require('mongoose');

const managerActivitySchema = new mongoose.Schema(
    {
        manager: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Manager',
        },
        checkInTime: { type: Date, required: true },
        breakTime: { type: Date, default: null },
        resumeTime: { type: Date, default: null },
        checkOutTime: { type: Date, default: null },
        manualEntries: [
            {
                startTime: { type: Date, required: true },
                endTime: { type: Date, required: true },
            },
        ],
        status: {
            type: String,
            enum: ['checked-in', 'on-break', 'working', 'checked-out'],
        },
    },
    { timestamps: true }
);

module.exports = new mongoose.model('Manager Activity', managerActivitySchema);
