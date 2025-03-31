const Holiday = require('../../models/holidayModel');

exports.getHoliday = async (req, res, next) => {
    try {
        const data = Holiday.find({ company: req.body.company });

        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};
