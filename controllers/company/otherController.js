const Holiday = require('../../models/holidayModel');

exports.addHoliday = async (req, res, next) => {
    try {
        const data = await Holiday.create({
            company: req.body.company,
            date: req.body.date,
            name: req.body.name,
        });

        res.status(201).json({
            success: true,
            message: 'Holiday created successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
};

exports.getHoliday = async (req, res, next) => {
    try {
        const data = await Holiday.find({ company: req.body.company });

        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

exports.editHoliday = async (req, res, next) => {
    try {
        const { name, date, companyId } = req.body;

        const data = await Holiday.findByIdAndUpdate(
            companyId,
            {
                name,
                date,
            },
            {
                new: true,
                runValidators: true,
            }
        );

        res.json({
            success: true,
            message: 'Holiday updated succefully',
            data,
        });
    } catch (error) {
        next(error);
    }
};
