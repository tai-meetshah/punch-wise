const Task = require('../../models/salesmanTaskModel');
const moment = require('moment');

//* salesman can not add task

const getDateRange = filter => {
    const now = moment();

    switch (filter) {
        case 'today':
            return {
                fromDate: now.startOf('day').toDate(),
                toDate: now.endOf('day').toDate(),
            };
        case 'thisMonth':
            return {
                fromDate: now.startOf('month').toDate(),
                toDate: now.endOf('month').toDate(),
            };
        case 'past7Days':
            return {
                toDate: now.endOf('day').toDate(),
                fromDate: now.subtract(7, 'days').toDate(),
            };
        case 'custom':
            return {};
        default:
            return {};
    }
};

exports.taskList = async (req, res, next) => {
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

        const tasks = await Task.find(query)
            .populate('manager')
            .populate('company')
            .select('-__v -salesman');

        res.json({
            success: true,
            tasks,
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
};

//! postman testing pendin
exports.changeShiftRequest = async (req, res, next) => {
    try {
        const { taskid, requestedShift, reason } = req.body;

        const leave = await Task.findById(taskid);
        if (!leave)
            return res
                .status(404)
                .json({ success: false, message: 'Task not found' });

        if (!leave.shiftChangeRequest) {
            leave.shiftChangeRequest = {};
        }

        leave.shiftChangeRequest.requestedShift = requestedShift;
        leave.shiftChangeRequest.reason = reason;
        leave.shiftChangeRequest.status = 'Pending';
        leave.shiftChangeRequest.requestedAt = new Date();

        await leave.save();

        res.json({
            success: true,
            message: 'Shift change request submitted',
            tasks: leave,
        });
    } catch (error) {
        next(error);
    }
};

exports.startTask = async (req, res, next) => {
    try {
        const { taskid } = req.body;

        const data = await Task.findById(taskid);
        if (!data)
            return res
                .status(404)
                .json({ success: false, message: 'Task not found' });

        data.status = 'Start';

        await data.save();

        res.json({
            success: true,
            message: 'Task started sucessfully',
            tasks: data,
        });
    } catch (error) {
        next(error);
    }
};

exports.completeTask = async (req, res, next) => {
    try {
        const { taskid, contactPersonName, contactPersonNumber, description } =
            req.body;

        const data = await Task.findById(taskid);
        if (!data)
            return res
                .status(404)
                .json({ success: false, message: 'Task not found' });

        data.contactPersonName = contactPersonName;
        data.contactPersonNumber = contactPersonNumber;
        data.description = description;
        data.upload = req.files.img
            ? `/uploads/${req.files.img[0].filename}`
            : '';

        await data.save();

        res.json({
            success: true,
            message: 'Task completed sucessfully',
            tasks: data,
        });
    } catch (error) {
        next(error);
    }
};
