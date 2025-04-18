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

            query.createdAt = {
                $gte: dateRange.fromDate,
                $lte: dateRange.toDate,
            };
        }
        // Handle custom date range
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
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
