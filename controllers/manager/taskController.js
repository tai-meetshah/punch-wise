const Client = require('../../models/clientModel');
const Task = require('../../models/salesmanTaskModel');
const Salesman = require('../../models/salesmanModel');
const moment = require('moment');

exports.getSalesmanList = async (req, res, next) => {
    try {
        let data = await Salesman.find({
            isDeleted: false,
            company: req.manager?.company,
        })
            .sort('-name')
            .select('name phone');

        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

exports.getClientList = async (req, res, next) => {
    try {
        let data = await Client.find({
            isDeleted: false,
            manager: req.manager?.id,
        })
            .sort('-name')
            .select('name phone');

        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

exports.addTask = async (req, res, next) => {
    try {
        const leave = await Task.create({
            salesman: req.body.salesman,
            manager: req.manager.id,
            client: req.body.client,

            startDate: req.body.startDate,
            task: req.body.task,
            priority: req.body.priority,
            shiftType: req.body.shiftType,
            deadline: req.body.deadline,

            attachment: req.files.attachment
                ? `/uploads/${req.files.attachment[0].filename}`
                : '',
        });

        return res.json({
            success: true,
            message: 'Task added succefully',
            task: leave,
        });
    } catch (error) {
        console.log('error: ', error);
        next(error);
    }
};

// !pending
exports.editTask = async (req, res, next) => {
    try {
        const updateData = {};

        ['startDate', 'task', 'priority', 'deadline', 'geofenceName'].forEach(
            field => {
                if (req.body[field]) updateData[field] = req.body[field];
            }
        );

        const data = await Task.findOneAndUpdate(
            { _id: req.params.id, status: 'Pending' },
            { $set: updateData },
            { new: true, runValidators: true }
        );
        if (!data)
            return res.status(404).json({
                success: false,
                message: 'Pending task request not found or cannot be edited',
            });

        res.json({
            success: true,
            message: 'Task edited successfully',
            task: data,
        });
    } catch (error) {
        next(error);
    }
};

exports.unblockTask = async (req, res, next) => {
    try {
        const leave = await Task.findOne({
            _id: req.params.id,
            status: 'Block',
        });
        if (!leave)
            return res.status(404).json({
                success: false,
                message: 'Block Task request not found or cannot be unblock',
            });

        await Task.findByIdAndUpdate(
            req.params.id,
            { status: 'Pending' },
            { strict: false }
        );

        res.json({
            success: true,
            message: 'Task unblocked successfully',
        });
    } catch (error) {
        next(error);
    }
};

exports.blockTask = async (req, res, next) => {
    try {
        const leave = await Task.findOne({
            _id: req.params.id,
            status: 'Pending',
        });
        if (!leave)
            return res.status(404).json({
                success: false,
                message: 'Pending Task request not found or cannot be block',
            });

        await Task.findByIdAndUpdate(
            req.params.id,
            { status: 'Block' },
            { strict: false }
        );

        res.json({
            success: true,
            message: 'Task blocked successfully',
        });
    } catch (error) {
        next(error);
    }
};

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
            .populate('salesman')
            .populate('company')
            .select('-__v -manager');

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

exports.changeShiftStatus = async (req, res, next) => {
    try {
        const { status, taskid } = req.body;

        if (!['Approved', 'Rejected'].includes(status))
            return res.status(400).json({
                success: false,
                message:
                    "Invalid status. Allowed values: 'Approved', 'Rejected'.",
            });

        const leave = await Task.findById(taskid);
        if (!leave)
            return res
                .status(404)
                .json({ success: false, message: 'Task not found' });

        if (status === 'Approved') {
            leave.shiftType = leave.shiftChangeRequest.requestedShift;
        }

        leave.shiftChangeRequest.status = status;
        leave.shiftChangeRequest.reviewedBy = req.manager.id;

        await leave.save();

        res.json({
            success: true,
            message: `Shift status updated successfully`,
            shift: leave,
        });
    } catch (error) {
        next(error);
    }
};
