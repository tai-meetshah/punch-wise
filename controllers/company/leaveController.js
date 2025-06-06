const SalesmanLeave = require('../../models/salesmanLeaveModel');
const ManagerLeave = require('../../models/managerLeaveModel');
const moment = require('moment');

exports.changeLeaveStatus = async (req, res, next) => {
    try {
        const { status, rejectReason, user } = req.body;

        if (!['Approved', 'Rejected'].includes(status))
            return res.status(400).json({
                success: false,
                message:
                    "Invalid status. Allowed values: 'Approved', 'Rejected'.",
            });

        let leave;
        if (user === 'salesman') {
            leave = await SalesmanLeave.findById(req.params.id);
            if (!leave)
                return res.status(404).json({
                    success: false,
                    message: 'Leave request not found',
                });

            leave.status = status;
            leave.rejectReason = rejectReason;
            leave.company = req.company.id;

            await leave.save();
        } else if (user === 'manager') {
            leave = await ManagerLeave.findById(req.params.id);
            if (!leave)
                return res.status(404).json({
                    success: false,
                    message: 'Leave request not found',
                });

            leave.status = status;
            leave.rejectReason = rejectReason;
            leave.company = req.company.id;

            await leave.save();
        }

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

exports.managerLeaveRequests = async (req, res, next) => {
    try {
        const leave = await ManagerLeave.find()
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

const getDateRange = filter => {
    const now = moment();

    switch (filter) {
        case 'today':
            return {
                fromDate: now.utc().startOf('day').toDate(),
                toDate: now.utc().endOf('day').toDate(),
            };
        case 'thisMonth':
            return {
                fromDate: now.utc().startOf('month').toDate(),
                toDate: now.utc().endOf('month').toDate(),
            };
        case 'past7Days':
            return {
                toDate: now.utc().endOf('day').toDate(),
                fromDate: now.utc().subtract(7, 'days').toDate(),
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

        if (status) query.status = { $in: status.split(',') };

        if (dateFilter && !startDate && !endDate) {
            const dateRange = getDateRange(dateFilter);
            query.requestedOn = {
                $gte: dateRange.fromDate,
                $lte: dateRange.toDate,
            };
        }

        // Handle custom date range
        if (startDate && endDate) {
            query.requestedOn = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        }

        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const skip = (pageNumber - 1) * limitNumber;

        const totalSalesmanLeaves = await SalesmanLeave.countDocuments(query);
        const totalManagerLeaves = await ManagerLeave.countDocuments(query);

        const leavesManager = await ManagerLeave.find(query)
            .populate('manager', 'name')
            .populate('salesman', 'name')
            .select('-__v -company')
            .skip(skip)
            .limit(limitNumber)
            .sort({ requestedOn: -1 });

        const leavesSalesman = await SalesmanLeave.find(query)
            .populate('salesman', 'name')
            .populate('manager', 'name')
            .select('-__v -company')
            .skip(skip)
            .limit(limitNumber)
            .sort({ requestedOn: -1 });

        res.json({
            success: true,
            page: pageNumber,
            limit: limitNumber,
            totalLeaves: totalSalesmanLeaves + totalManagerLeaves,
            totalPages: Math.ceil(totalLeaves / limitNumber),
            leaves: { ...leavesManager, ...leavesSalesman },
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
};
