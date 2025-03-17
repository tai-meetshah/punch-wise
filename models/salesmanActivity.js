const mongoose = require('mongoose');

const salesmanActivitySchema = new mongoose.Schema(
    {
        salesmanId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Salesman',
        },
        date: { type: Date, required: true }, // Store only the date (without time) for grouping

        checkInTime: { type: Date },
        breakTime: [{ start: Date, end: Date }],
        checkOutTime: { type: Date },
        checkOutNotes: { type: String },

        totalWorkingHoursToday: { type: Number, default: 0 }, // In hours
        totalWorkingHoursMonth: { type: Number, default: 0 }, // In hours

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

SalesmanActivitySchema.methods.calculateTotalHours = function () {
    if (!this.checkInTime || !this.checkOutTime) return;

    let totalHours = (this.checkOutTime - this.checkInTime) / (1000 * 60 * 60); // Convert ms to hours

    // Subtract break time
    this.breakTime.forEach(b => {
        if (b.start && b.end) {
            totalHours -= (b.end - b.start) / (1000 * 60 * 60);
        }
    });

    this.totalWorkingHoursToday = totalHours;
};

module.exports = new mongoose.model(
    'Salesman Activity',
    salesmanActivitySchema
);
