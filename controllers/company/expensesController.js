const Expenses = require('../../models/managerExpensesModel');
const SalesmanExpenses = require('../../models/salesmanExpensesModel');
const ManagerExpenses = require('../../models/managerExpensesModel');

const moment = require('moment');

//! work pending
// Company change status of salesman
exports.changeExpensesStatus = async (req, res, next) => {
    try {
        const { status, rejectReason } = req.body;

        if (!['Approved', 'Rejected'].includes(status))
            return res.status(400).json({
                success: false,
                message:
                    "Invalid status. Allowed values: 'Approved', 'Rejected'.",
            });

        const leave = await SalesmanExpenses.findById(req.params.id);
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
            expenses: leave,
        });
    } catch (error) {
        next(error);
    }
};

exports.salesmanExpensesRequests = async (req, res, next) => {
    try {
        const leave = await SalesmanExpenses.find()
            .populate('salesman', 'name')
            .select('-manager -__v')
            .lean();
        if (!leave || leave.length === 0)
            return res.status(404).json({
                success: false,
                message: 'expenses request not found',
            });

        res.json({
            success: true,
            expenses: leave,
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

exports.expensesList = async (req, res, next) => {
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

        if (dateFilter) {
            const dateRange = getDateRange(dateFilter);

            query.date = { $gte: dateRange.fromDate, $lte: dateRange.toDate };
        }
        // Handle custom date range
        if (startDate && endDate) {
            query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const skip = (pageNumber - 1) * limitNumber;

        const totalExpenses = await Expenses.countDocuments(query);

        const expenses = await Expenses.find(query)
            .populate('manager', 'name')
            .populate('company', 'name')
            .select('-__v -salesman')
            .skip(skip)
            .limit(limitNumber);

        res.json({
            success: true,
            page: pageNumber,
            limit: limitNumber,
            totalExpenses,
            totalPages: Math.ceil(totalExpenses / limitNumber),
            expenses,
        });
    } catch (error) {
        next(error);
    }
};
