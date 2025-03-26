const createError = require('http-errors');
const message = require('../../utils/message.json');
const SalesmanLeave = require('../../models/salesmanLeaveModel');
const Leave = require('../../models/managerLeaveModel');

// Manager change leave status of salesman
exports.changeLeaveStatus = async (req, res, next) => {
    try {
        const { status, rejectReason } = req.body;

        if (!['Approved', 'Rejected'].includes(status))
            return res.status(400).json({
                success: false,
                message:
                    "Invalid status. Allowed values: 'Approved', 'Rejected'.",
            });

        const leave = await SalesmanLeave.findById(req.params.id);
        if (!leave)
            return res
                .status(404)
                .json({ success: false, message: 'Leave request not found' });

        leave.status = status;
        leave.rejectReason = rejectReason;
        leave.manager = req.manager.id;

        await leave.save();

        res.json({
            success: true,
            message: `Leave status updated to ${status} successfully`,
            leave,
        });
    } catch (error) {
        next(error);
    }
};

exports.salesmanLeaveRequests = async (req, res, next) => {
    try {
        const leave = await SalesmanLeave.find()
            .populate('salesman', 'name')
            .select('-manager -__v')
            .lean();
        if (!leave || leave.length === 0)
            return res
                .status(404)
                .json({ success: false, message: 'Leave request not found' });

        leave.manager = undefined;

        res.json({
            success: true,
            leave,
        });
    } catch (error) {
        next(error);
    }
};

// Manager post leave for self
exports.addLeave = async (req, res, next) => {
    try {
        const leave = await Leave.create({
            manager: req.manager.id,
            leaveType: req.body.leaveType,
            fromDate: req.body.fromDate,
            toDate: req.body.toDate,
            halfDay: req.body.halfDay,
            notes: req.body.notes,
        });

        return res.json({
            success: true,
            message: 'Leave request submited succefully',
            leave,
        });
    } catch (error) {
        console.log('error: ', error);
        next(error);
    }
};

exports.editLeave = async (req, res, next) => {
    try {
        const updateData = {};

        ['leaveType', 'fromDate', 'toDate', 'halfDay', 'notes'].forEach(
            field => {
                if (req.body[field]) updateData[field] = req.body[field];
            }
        );

        const data = await Leave.findOneAndUpdate(
            { _id: req.params.id, status: 'Pending' },
            { $set: updateData },
            { new: true, runValidators: true }
        );
        if (!data)
            return res.status(404).json({
                success: false,
                message: 'Pending leave request not found or cannot be edited',
            });

        res.json({
            success: true,
            message: 'Leave edited successfully',
            leave: data,
        });
    } catch (error) {
        next(error);
    }
};

exports.cancelLeave = async (req, res, next) => {
    try {
        const leave = await Leave.findOne({
            _id: req.params.id,
            status: 'Pending',
        });
        if (!leave)
            return res.status(404).json({
                success: false,
                message:
                    'Pending leave request not found or cannot be cancelled',
            });

        await Leave.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Leave request cancelled successfully',
        });
    } catch (error) {
        next(error);
    }
};

exports.leaveList = async (req, res, next) => {
    try {
        const { status, dateFilter, startDate, endDate } = req.query;
        let query = {};

        if (status) query.status = status;

        if (dateFilter) {
            const dateRange = getDateRange(dateFilter);

            query.fromDate = { $gte: dateRange.fromDate };
            query.toDate = { $lte: dateRange.toDate };
        }

        // Handle custom date range
        if (startDate && endDate) {
            query.fromDate = { $gte: new Date(startDate) };
            query.toDate = { $lte: new Date(endDate) };
        }

        const leaves = await Leave.find(query)
            .populate('company')
            .select('-__v -manager');

        res.json({
            success: true,
            leaves,
        });
    } catch (error) {
        next(error);
    }
};
