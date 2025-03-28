const Leave = require('../../models/salesmanLeaveModel');
const moment = require('moment');

exports.addLeave = async (req, res, next) => {
    try {
        const leave = await Leave.create({
            salesman: req.salesman.id,
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

exports.leaveList = async (req, res, next) => {
    try {
        const {
            status,
            dateFilter,
            startDate,
            endDate,
            page = 1,
            limit = 10,
        } = req.query;
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

        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const skip = (pageNumber - 1) * limitNumber;

        const totalLeaves = await Leave.countDocuments(query);

        const leaves = await Leave.find(query)
            .populate('manager', 'name')
            .populate('company', 'name')
            .select('-__v -salesman')
            .skip(skip)
            .limit(limitNumber);

        res.json({
            success: true,
            page: pageNumber,
            limit: limitNumber,
            totalLeaves,
            totalPages: Math.ceil(totalLeaves / limitNumber),
            leaves,
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
};
