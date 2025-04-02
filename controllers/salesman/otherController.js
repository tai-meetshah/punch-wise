const Holiday = require('../../models/holidayModel');
const Company = require('../../models/companyModel');
const Business = require('../../models/businessModel');

exports.getHoliday = async (req, res, next) => {
    try {
        const data = await Holiday.find({
            company: req.salesman?.company,
        }).lean();

        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

exports.getCompany = async (req, res, next) => {
    try {
        const companyId = req.salesman?.company;
        const [company, business] = await Promise.all([
            Company.findOne({ _id: companyId }).lean(),
            Business.findOne({ company: companyId }).lean(),
        ]);

        company.salesman = undefined;
        company.role = undefined;
        company.manager = undefined;
        company.client = undefined;
        company.fcmToken = undefined;
        company.step = undefined;
        company.gender = undefined;

        res.json({ success: true, data: { ...company, ...business } });
    } catch (error) {
        next(error);
    }
};
