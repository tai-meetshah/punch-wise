const bcrypt = require('bcryptjs');
const createError = require('http-errors');
const message = require('../../utils/message.json');

const Manager = require('../../models/managerModel');

exports.getProfile = async (req, res, next) => {
    try {
        const vendor = { ...req.manager._doc };

        delete vendor.password;
        delete vendor.favourites;
        delete vendor.__v;
        delete vendor.date;

        res.json({ success: true, vendor });
    } catch (error) {
        next(error);
    }
};

exports.editProfile = async (req, res, next) => {
    try {
        if (req.file) req.body.photo = `/uploads/${req.file.filename}`;

        delete req.body.email;
        delete req.body.password;

        const vendor = await Manager.findByIdAndUpdate(
            req.manager.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        res.json({
            success: true,
            message: message.success.profileUpdateSuccefully,
            vendor,
        });
    } catch (error) {
        next(error);
    }
};

exports.changePassword = async (req, res, next) => {
    try {
        const vendor = req.manager;
        const { password, newPassword } = req.body;

        if (!password)
            return next(createError.BadRequest(message.error.password));

        if (password == newPassword)
            return next(createError.BadRequest(message.error.samePassword));

        const isMatch = await bcrypt.compare(password, vendor.password);
        if (!isMatch)
            return next(createError.BadRequest(message.error.wrongPassword));

        vendor.password = newPassword;
        await vendor.save();

        res.json({
            success: true,
            message: message.success.passwordUpdated,
        });
    } catch (error) {
        next(error);
    }
};
