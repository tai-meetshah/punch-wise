const SalesmanActivity = require('../../models/salesmanActivity');

exports.checkInTime = async (req, res, next) => {
    try {
        const { salesmanId } = req.body;

        // Prevent multiple check-ins
        const existingRecord = await SalesmanActivity.findOne({
            salesmanId,
            checkOutTime: null,
        });
        if (existingRecord)
            return res
                .status(400)
                .json({ success: true, message: 'Already checked in' });

        const newEntry = new SalesmanActivity({
            salesmanId,
            checkInTime: new Date(),
        });

        await newEntry.save();

        res.status(201).json({
            success: true,
            message: 'Checked in successfully',
            data: newEntry,
        });
    } catch (error) {
        next(error);
    }
};

exports.startBreak = async (req, res, next) => {
    try {
        const { salesmanId } = req.body;
        const record = await SalesmanActivity.findOne({
            salesmanId,
            checkOutTime: null,
        });

        if (!record)
            return res
                .status(404)
                .json({ success: true, message: 'No active check-in found' });

        record.breakTime.push({ start: new Date() });
        await record.save();

        res.status(200).json({
            success: true,
            message: 'Break started',
            data: record,
        });
    } catch (error) {
        next(error);
    }
};

exports.endBreak = async (req, res, next) => {
    try {
        const { salesmanId } = req.body;
        const record = await SalesmanActivity.findOne({
            salesmanId,
            checkOutTime: null,
        });
        if (!record || record.breakTime.length === 0)
            return res
                .status(404)
                .json({ success: true, message: 'No active break found' });

        const lastBreak = record.breakTime[record.breakTime.length - 1];
        if (!lastBreak.end) lastBreak.end = new Date(); // Close the last open break

        await record.save();
        res.status(200).json({
            success: true,
            message: 'Break ended',
            data: record,
        });
    } catch (error) {
        next(error);
    }
};

exports.checkOut = async (req, res, next) => {
    try {
        const { salesmanId, checkOutNotes } = req.body;
        const record = await SalesmanActivity.findOne({
            salesmanId,
            checkOutTime: null,
        });
        if (!record)
            return res
                .status(404)
                .json({ success: true, message: 'No active check-in found' });

        record.checkOutTime = new Date();
        record.checkOutNotes = checkOutNotes;
        record.calculateTotalHours();
        await record.save();

        res.status(200).json({
            success: true,
            message: 'Checked out successfully',
            data: record,
        });
    } catch (error) {
        next(error);
    }
};

// 📌 Get Today's & Monthly Working Hours HOME SCREEN
exports.workingHours = async (req, res, next) => {
    try {
        const { salesmanId } = req.params;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get today's working hours
        const todayRecord = await SalesmanActivity.findOne({
            salesmanId,
            date: { $gte: today },
        });
        const todayHours = todayRecord ? todayRecord.totalWorkingHoursToday : 0;

        // Get current month's working hours
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthlyRecords = await SalesmanActivity.find({
            salesmanId,
            date: { $gte: startOfMonth },
        });

        const monthlyHours = monthlyRecords.reduce(
            (sum, rec) => sum + (rec.totalWorkingHoursToday || 0),
            0
        );

        res.status(200).json({
            success: true,
            todayTotal: todayHours,
            currentMonthTotal: monthlyHours,
        });
    } catch (error) {
        next(error);
    }
};

// 📌 Get Today's Working Hours
exports.TodayWorkingHours = async (req, res, next) => {
    try {
        const { salesmanId } = req.params;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get today's working hours
        const todayRecord = await SalesmanActivity.findOne({
            salesmanId,
            date: { $gte: today },
        });
        const todayHours = todayRecord ? todayRecord.totalWorkingHoursToday : 0;

        res.status(200).json({
            success: true,
            todayTotal: todayHours,
        });
    } catch (error) {
        next(error);
    }
};
