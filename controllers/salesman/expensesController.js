const Expenses = require('../../models/salesmanExpensesModel');
const moment = require('moment');

exports.addExpenses = async (req, res, next) => {
    try {
        const expenses = await Expenses.create({
            salesman: req.salesman.id,
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
        const updateData = {};

        ['date', 'expensesFor', 'amount', 'description'].forEach(field => {
            if (req.body[field]) updateData[field] = req.body[field];
        });

        if (req.files && req.files.receipt)
            updateData.receipt = `/uploads/${req.files.receipt[0].filename}`;

        const updatedExpense = await Expenses.findOneAndUpdate(
            { _id: req.params.id, status: 'Pending' },
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedExpense) {
            return res.status(404).json({
                success: false,
                message:
                    'Pending expenses request not found or cannot be edited',
            });
        }

        res.json({
            success: true,
            message: 'Expenses edited successfully',
            expenses: updatedExpense,
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
            .populate('manager')
            .populate('company')
            .select('-__v -salesman');

        res.json({
            success: true,
            expenses,
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
};
