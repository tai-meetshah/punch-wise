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
    shiftType: { type: String },
    deadline: { type: Date, required: true },

    // coordinates: {
    //     type: { type: String, enum: ['Point'], default: 'Point' },
    //     coordinates: { type: [Number] },
    // },
    attachment: { type: String },

    geofenceName: { type: String },
    shapeType: { type: String, enum: ['rectangle', 'circle'] },
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
        enum: ['Pending', 'Block', 'Start', 'Completed'], // Start = Todo
        default: 'Pending',
    },
    feedback: { type: String },

    contactPersonName: { type: String },
    contactPersonNumber: { type: String },
    upload: { type: String },
    description: { type: String },

    // ** Shift Type Change Request**
    shiftChangeRequest: {
        requestedShift: { type: String },
        reason: { type: String },
        status: {
            type: String,
            enum: ['Pending', 'Approved', 'Rejected'],
            // default: 'Pending',
        },
        requestedAt: { type: Date, default: Date.now },
        reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    },
    requestedOn: { type: Date, default: Date.now },
});

taskSchema.index({ coordinates: '2dsphere' });

module.exports = new mongoose.model('Manager Task', taskSchema);
