const Vendor = require('../../models/vendorModel');
const User = require('../../models/userModel');
const ClaimRequest = require('../../models/claimRequestModel');

const { VendorMessage } = require('../../models/messageModel');

exports.getAllVendors = async (req, res) => {
    try {
        const vendors = await Vendor.find()
            .populate('event', 'name')
            .select('+blocked')
            .sort('-_id');

        res.render('vendor', { vendors });
    } catch (error) {
        req.flash('red', error.message);
        res.redirect('/');
    }
};

exports.viewVendor = async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.params.id).populate(
            'event',
            'name eventCode'
        );
        if (!vendor) {
            req.flash('red', 'Vendor not found!');
            return res.redirect('/vendor');
        }

        res.render('vendor_view', { vendor });
    } catch (error) {
        if (error.name === 'CastError') req.flash('red', 'Vendor not found!');
        else req.flash('red', error.message);
        res.redirect('/vendor');
    }
};

exports.getAllMessages = async (req, res) => {
    try {
        const msgs = await VendorMessage.find().sort('-_id');

        res.render('vendor_message', { msgs });
    } catch (error) {
        req.flash('red', error.message);
        res.redirect('/');
    }
};

exports.viewMessages = async (req, res) => {
    try {
        const message = await VendorMessage.findById(req.params.id);
        if (!message) {
            req.flash('red', 'Message not found!');
            return res.redirect('/message-vendor');
        }

        res.render('vendor_message_view', { message });
    } catch (error) {
        if (error.name === 'CastError') req.flash('red', 'Message not found!');
        else req.flash('red', error.message);
        res.redirect('/message-vendor');
    }
};

exports.getDeleteMessages = async (req, res) => {
    try {
        await VendorMessage.findByIdAndDelete(req.params.id);

        req.flash('green', 'Message deleted successfully.');
        res.redirect('/message-vendor');
    } catch (error) {
        if (error.name === 'CastError' || error.name === 'TypeError')
            req.flash('red', 'Message not found!');
        else req.flash('red', error.message);
        res.redirect('/message-vendor');
    }
};

exports.blockVendor = async (req, res) => {
    try {
        const vendor = await Vendor.findByIdAndUpdate(
            req.params.id,
            { blocked: true },
            { strict: false }
        );
        req.flash('green', `'${vendor.name}' blocked successfully.`);
        res.redirect('/vendor');
    } catch (error) {
        if (error.name === 'CastError' || error.name === 'TypeError')
            req.flash('red', 'Vendor not found!');
        else req.flash('red', error.message);
        res.redirect('/vendor');
    }
};

exports.unblockVendor = async (req, res) => {
    try {
        const vendor = await Vendor.findByIdAndUpdate(
            req.params.id,
            { blocked: false },
            { strict: false }
        );
        req.flash('green', `'${vendor.name}' unblocked successfully.`);
        res.redirect('/vendor');
    } catch (error) {
        if (error.name === 'CastError' || error.name === 'TypeError')
            req.flash('red', 'Vendor not found!');
        else req.flash('red', error.message);
        res.redirect('/vendor');
    }
};

exports.getDeleteVendor = async (req, res) => {
    try {
        await Promise.all([
            Vendor.deleteOne({ _id: req.params.id }),
            ClaimRequest.deleteMany({ vendor: req.params.id }),
            User.updateMany(
                { favourites: req.params.id, isDeleted: false },
                { $pull: { favourites: req.params.id } }
            ),
        ]);

        req.flash('green', 'Vendor deleted successfully.');
        res.redirect('/vendor');
    } catch (error) {
        console.log('error: ', error);
        if (error.name === 'CastError') req.flash('red', 'Vendor not found!');
        else req.flash('red', error.message);
        res.redirect('/vendor');
    }
};
