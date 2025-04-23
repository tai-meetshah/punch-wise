const bcrypt = require('bcryptjs');
const createError = require('http-errors');
const message = require('../../utils/message.json');

const Company = require('../../models/companyModel');

exports.getProfile = async (req, res, next) => {
    try {
        const company = { ...req.company._doc };

        // Hide fields
        delete company.password;
        delete company.__v;
        delete company.date;

        res.json({ success: true, company });
    } catch (error) {
        next(error);
    }
};

exports.editProfile = async (req, res, next) => {
    try {
        if (req.file) req.body.photo = `/uploads/${req.file.filename}`;

        // Not allowed to change
        delete req.body.phone;
        delete req.body.password;

        const user = await Company.findByIdAndUpdate(
            req.company.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        res.json({
            success: true,
            message: message.success.profileUpdateSuccefully,
            company: user,
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
