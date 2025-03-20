const Expenses = require('../../models/managerExpensesModel');
const SalesmanExpenses = require('../../models/salesmanExpensesModel');

const moment = require('moment');

// Manager change status of salesman
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

exports.addExpenses = async (req, res, next) => {
    try {
        const expenses = await Expenses.create({
            manager: req.manager.id,
            date: req.body.date,
            expensesFor: req.body.expensesFor,
            amount: req.body.amount,
            description: req.body.description,
            receipt: req.files.receipt
                ? `/uploads/${req.files.receipt[0].filename}`
                : '',
        });

        return res.json({
            success: true,
            message: 'Expenses request submited succefully',
            expenses,
        });
    } catch (error) {
        next(error);
    }
};

exports.editExpenses = async (req, res, next) => {
    try {
        const expenses = await Expenses.findOne({
            _id: req.params.id,
            status: 'Pending',
        });
        if (!expenses)
            return res.status(404).json({
                success: false,
                message:
                    'Pending expenses request not found or cannot be edited',
            });

        expenses.date = req.body.date;
        expenses.expensesFor = req.body.expensesFor;
        expenses.amount = req.body.amount;
        expenses.description = req.body.description;
        expenses.receipt = req.files.receipt
            ? `/uploads/${req.files.receipt[0].filename}`
            : '';

        await expenses.save();

        res.json({
            success: true,
            message: 'expenses edited successfully',
            expenses,
        });
    } catch (error) {
        next(error);
    }
};

exports.cancelExpenses = async (req, res, next) => {
    try {
        const expenses = await Expenses.findOne({
            _id: req.params.id,
            status: 'Pending',
        });
        if (!expenses)
            return res.status(404).json({
                success: false,
                message:
                    'Pending expenses request not found or cannot be cancelled',
            });

        await Expenses.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Expenses request cancelled successfully',
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
        const { status, dateFilter, startDate, endDate } = req.query;
        let query = {};

        if (status) query.status = status;
        if (dateFilter) {
            const dateRange = getDateRange(dateFilter);

            query.date = { $gte: dateRange.fromDate, $lte: dateRange.toDate };
        }
        // Handle custom date range
        if (startDate && endDate) {
            query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        const expenses = await Expenses.find(query)
            .populate('company')
            .populate('manager')
            .populate('salesman')
            .select('-__v -manager');

        res.json({
            success: true,
            expenses,
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
};
