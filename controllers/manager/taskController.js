const Client = require('../../models/clientModel');
const Task = require('../../models/managerTaskModel');
const Salesman = require('../../models/salesmanModel');
const moment = require('moment');

exports.getSalesmanList = async (req, res, next) => {
    try {
        let data = await Salesman.find({ isDeleted: false })
            .sort('-name')
            .select('name phone');

        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

exports.getClientList = async (req, res, next) => {
    try {
        let data = await Client.find({ isDeleted: false })
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
            salesman: req.salesman.id,
            manager: req.manager.id,
            client: req.client.id,

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
            message: 'Task request submited succefully',
            task: leave,
        });
    } catch (error) {
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
            message: 'Task blocked successfully',
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
