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

        const totalTask = await Task.countDocuments(query);

        const tasks = await Task.find(query)
            .populate('manager', 'name photo')
            .populate('client', 'businessName name')
            .select('-__v -salesman')
            .skip(skip)
            .limit(limitNumber)
            .sort('-_id');

        res.json({
            success: true,
            page: pageNumber,
            limit: limitNumber,
            totalTask,
            totalPages: Math.ceil(totalTask / limitNumber),
            tasks,
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
};

exports.shiftList = async (req, res, next) => {
    try {
        const {
            status,
            dateFilter,
            startDate,
            endDate,
            page = 1,
            limit = 10,
        } = req.query;
        let query = {
            'shiftChangeRequest.status': { $exists: true },
            salesman: req.salesman.id,
        };

        if (status)
            query['shiftChangeRequest.status'] = { $in: status.split(',') };

        if (dateFilter && !startDate && !endDate) {
            const dateRange = getDateRange(dateFilter);
            query.requestedAt = {
                $gte: dateRange.fromDate,
                $lte: dateRange.toDate,
            };
        }

        // Handle custom date range
        if (startDate && endDate) {
            query.requestedAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        }

        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const skip = (pageNumber - 1) * limitNumber;

        const totalTasks = await Task.countDocuments(query);

        const data = await Task.find(query)
            .populate('salesman', 'name')
            .populate('client', 'name businessName')
            .populate('manager', 'name')
            .populate('shiftChangeRequest.reviewedBy', 'name')
            .populate('company', 'name')
            .skip(skip)
            .limit(limitNumber)
            .sort({ 'shiftChangeRequest.requestedAt': -1 });

        res.json({
            success: true,
            page: pageNumber,
            limit: limitNumber,
            totalTasks,
            totalPages: Math.ceil(totalTasks / limitNumber),
            data,
        });
    } catch (error) {
        next(error);
    }
};

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

exports.editShift = async (req, res, next) => {
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
            message: 'Shift updated sucessfully',
            tasks: leave,
        });
    } catch (error) {
        next(error);
    }
};

exports.cancellShift = async (req, res, next) => {
    try {
        const { taskid } = req.body;

        const leave = await Task.findById(taskid);
        if (!leave)
            return res
                .status(404)
                .json({ success: false, message: 'Task not found' });

        leave.shiftChangeRequest = undefined;

        await leave.save();

        res.json({
            success: true,
            message: 'Shift change cancelled successfully',
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

        data.status = 'Completed';
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

exports.editTask = async (req, res, next) => {
    try {
        const updateData = {};

        [
            'taskid',
            'contactPersonName',
            'contactPersonNumber',
            'description',
        ].forEach(field => {
            if (req.body[field]) updateData[field] = req.body[field];
        });

        if (req.files && req.files.img)
            updateData.upload = `/uploads/${req.files.img[0].filename}`;

        const data = await Task.findOneAndUpdate(
            { _id: req.params.id },
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!data) {
            return res.status(404).json({
                success: false,
                message: 'Task not found.',
            });
        }

        res.json({
            success: true,
            message: 'Task edited successfully',
            task: data,
        });
    } catch (error) {
        next(error);
    }
};
