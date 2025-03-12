const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true,
    },

    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Manager',
        required: true,
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
    },

    startDate: { type: Date, required: true },
    task: { type: String, required: true },
    priority: { type: String, required: true },
    shiftType: { type: String, required: true },
    deadline: { type: Date, required: true },

    // coordinates: {
    //     type: { type: String, enum: ['Point'], default: 'Point' },
    //     coordinates: { type: [Number] },
    // },
    attachment: { type: String, required: true },

    geofenceName: { type: String },
    shapeType: { type: String, enum: ['rectangle', 'circle'], required: true },
    // Circle Geofence (Uses GeoJSON)
    center: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: {
            type: [Number],
            required: function () {
                return this.shapeType === 'circle';
            },
        }, // [longitude, latitude]
    },
    radius: {
        type: Number,
        required: function () {
            return this.shapeType === 'circle';
        },
    }, // in meters

    // Rectangle Geofence
    coordinates: {
        type: [[Number]], // 2D array for rectangle coordinates
        required: function () {
            return this.shapeType === 'rectangle';
        },
    },

    status: {
        type: String,
        enum: ['Pending', 'Block', 'Unblock', 'Start', 'Completed'], // Start = Todo
        default: 'Pending',
    },
    feedback: { type: Strings },

    contactPersonName: { type: Strings },
    contactPersonNumber: { type: Strings },
    upload: { type: Strings },
    description: { type: Strings },

    requestedOn: { type: Date, default: Date.now },
});

taskSchema.index({ coordinates: '2dsphere' });

module.exports = new mongoose.model('Manager Task', taskSchema);
