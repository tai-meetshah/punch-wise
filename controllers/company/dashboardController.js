const bcrypt = require('bcryptjs');
const createError = require('http-errors');
const message = require('../../utils/message.json');

const Salesman = require('../../models/salesmanModel');

exports.getProfile = async (req, res, next) => {
    try {
        const user = { ...req.salesman._doc };

        // Hide fields
        delete user.password;
        delete user.favourites;
        delete user.__v;
        delete user.date;

        res.json({ success: true, user });
    } catch (error) {
        next(error);
    }
};

exports.editProfile = async (req, res, next) => {
    try {
        if (req.file) req.body.photo = `/uploads/${req.file.filename}`;

        // Not allowed to change
        delete req.body.email;
        delete req.body.password;

        const user = await Salesman.findByIdAndUpdate(
            req.salesman.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        res.json({
            success: true,
            message: message.success.profileUpdateSuccefully,
            user,
        });
    } catch (error) {
        next(error);
    }
};

exports.changePasswordCheck = async (req, res, next) => {
    try {
        const user = req.company;
        const { password } = req.body;
        if (!password)
            return next(createError.BadRequest('Please provide PIN.'));

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return next(createError.BadRequest('PIN incorrect.'));

        res.json({
            success: true,
            message: 'PIN match succefully.',
        });
    } catch (error) {
        next(error);
    }
};

exports.changePassword = async (req, res, next) => {
    try {
        const user = req.company;
        const { password, newPassword } = req.body;

        if (!password)
            return next(createError.BadRequest(message.error.password));

        if (password == newPassword)
            return next(createError.BadRequest(message.error.samePassword));

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return next(createError.BadRequest(message.error.wrongPassword));

        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: message.success.passwordUpdated,
        });
    } catch (error) {
        next(error);
    }
};
