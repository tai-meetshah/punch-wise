const createError = require('http-errors');
const message = require('../../utils/message.json');
const Leave = require('../../models/salesmanLeaveModel');

exports.editProfile = async (req, res, next) => {
    try {
        if (req.file) req.body.photo = `/uploads/${req.file.filename}`;

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

exports.changePassword = async (req, res, next) => {
    try {
        const user = req.salesman;
        const { password, newPassword } = req.body;

        if (!password)
            return next(createError.BadRequest(message.error.password));

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

exports.cancelLeave = async (req, res, next) => {
    try {
        const leave = await Leave.findById(req.params.id);
        if (!leave) {
            return res
                .status(404)
                .json({ success: false, message: 'Leave request not found' });
        }

        if (leave.status === 'Pending') {
            leave.status = 'Cancelled';
            await leave.save();

            return res.json({
                success: true,
                message: 'Leave request cancelled successfully',
                leave,
            });
        }
        return res.json({
            success: false,
            message: 'Leave cannot be cancelled',
        });
    } catch (error) {
        next(error);
    }
};
