const { sendNotification } = require('../../utils/sendNotification');
const {
    sendAcceptanceEmail,
    sendRejectionEmail,
} = require('../../utils/sendMail');

const ClaimRequest = require('../../models/claimRequestModel');
const Vendor = require('../../models/vendorModel');
const Notification = require('../../models/notificationModel');

exports.getAllRequests = async (req, res) => {
    try {
        const requests = await ClaimRequest.find()
            .sort('-_id')
            .populate('vendor', 'name email')
            .populate('event', 'name');

        res.render('claim', { requests });
    } catch (error) {
        req.flash('red', error.message);
        res.redirect('/');
    }
};

// exports.getAllRequests = async (req, res) => {
//     try {
//         const requests = await ClaimRequest.aggregate([
//             { $match: { vendor: { $ne: null } } },
//             { $sort: { _id: -1 } },
//             {
//                 $lookup: {
//                     from: 'vendors',
//                     localField: 'vendor',
//                     foreignField: '_id',
//                     as: 'vendor',
//                 },
//             },
//             {
//                 $lookup: {
//                     from: 'events',
//                     localField: 'event',
//                     foreignField: '_id',
//                     as: 'event',
//                 },
//             },
//             { $unwind: '$vendor' },
//             { $unwind: '$event' },
//             {
//                 $project: {
//                     'vendor._id': 1,
//                     'vendor.name': 1,
//                     'vendor.email': 1,
//                     'event._id': 1,
//                     'event.name': 1,
//                     status: 1,
//                     date: 1,
//                 },
//             },
//         ]);
//             console.log('requests: ', requests);

//         res.render('claim', { requests });
//     } catch (error) {
//         req.flash('red', error.message);
//         res.redirect('/');
//     }
// };

exports.viewRequest = async (req, res) => {
    try {
        const request = await ClaimRequest.findById(req.params.id)
            .populate('vendor', 'name email photo')
            .populate('event', 'name eventCode');
        if (!request) {
            req.flash('red', 'Vendor request not found!');
            return res.redirect('/claim');
        }

        res.render('claim_view', { request });
    } catch (error) {
        if (error.name === 'CastError')
            req.flash('red', 'Vendor request not found!');
        else req.flash('red', error.message);
        res.redirect('/claim');
    }
};

exports.approveRequest = async (req, res) => {
    try {
        const request = await ClaimRequest.findByIdAndUpdate(
            req.params.id,
            { status: 'approved' },
            { new: true, runValidators: true }
        )
            .populate('vendor', 'fcmToken email name qrCode')
            .populate('event', '-__v');

        await Vendor.findByIdAndUpdate(request.vendor._id, {
            isVerified: true,
        });

        // Notify
        sendNotification(
            'Request Accepted',
            'Now you can access your application.',
            request.vendor.fcmToken,
            { type: 'request' }
        );

        await Notification.create({
            recipientId: request.vendor._id,
            recipientModel: 'Vendor',
            title: 'Request Accepted',
            message: 'Now you can access your application.',
        });

        //todo Send email pending
        // sendAcceptanceEmail(request.vendor.email, request);

        req.flash('green', 'Vendor request approved successfully.');
        res.redirect('/claim');
    } catch (error) {
        if (error.name === 'CastError')
            req.flash('red', 'Vendor request not found!');
        else req.flash('red', error.message);
        res.redirect('/claim');
    }
};

exports.rejectRequest = async (req, res) => {
    try {
        const request = await ClaimRequest.findByIdAndUpdate(
            req.params.id,
            { status: 'rejected' },
            { new: true, runValidators: true }
        ).populate('vendor', 'fcmToken email');

        // Notify
        sendNotification(
            'Request Rejected',
            'Please contact admin.',
            request.vendor.fcmToken,
            { type: 'request' }
        );

        // send email
        sendRejectionEmail(request.vendor.email);

        req.flash('green', 'Vendor request rejected successfully.');
        res.redirect('/claim');
    } catch (error) {
        if (error.name === 'CastError')
            req.flash('red', 'Vendor request not found!');
        else req.flash('red', error.message);
        res.redirect('/claim');
    }
};
