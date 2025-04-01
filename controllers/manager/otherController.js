const Holiday = require('../../models/holidayModel');
const Company = require('../../models/companyModel');

exports.getHoliday = async (req, res, next) => {
    try {
        const data = Holiday.find({ company: req.body.company });

        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

exports.getCompany = async (req, res, next) => {
    try {
        const data = Company.find({ id: req.body.company });

        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};
