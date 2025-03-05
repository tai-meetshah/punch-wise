const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'recipientModel',
        required: true,
    },
    recipientModel: {
        type: String,
        enum: ['User', 'Vendor'],
        required: true,
    },

    title: String,
    message: String,
    image: { type: String, default: '/uploads/Notification_img.jpg' },

    createdAt: { type: Date, default: Date.now },
    expireAt: {
        type: Date,
        expires: 0,
        default: () => new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // Expires after 60 days
    },
});

notificationSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 }); // Set up TTL index

module.exports = new mongoose.model('Notification', notificationSchema);
