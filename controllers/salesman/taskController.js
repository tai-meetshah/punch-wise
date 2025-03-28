const Task = require('../../models/salesmanTaskModel');
const moment = require('moment');

exports.addTask = async (req, res, next) => {
    try {
        const leave = await Task.create({
            salesman: req.salesman.id,
            leaveType: req.body.leaveType,
            fromDate: req.body.fromDate,
            toDate: req.body.toDate,
            halfDay: req.body.halfDay,
            notes: req.body.notes,
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

exports.cancelTask = async (req, res, next) => {
    try {
        const leave = await Task.findOne({
            _id: req.params.id,
            status: 'Pending',
        });
        if (!leave)
            return res.status(404).json({
                success: false,
                message:
                    'Pending Task request not found or cannot be cancelled',
            });

        await Task.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Task request cancelled successfully',
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
