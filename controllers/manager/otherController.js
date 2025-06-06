const Holiday = require('../../models/holidayModel');
const Company = require('../../models/companyModel');
const Client = require('../../models/clientModel');
const Salesman = require('../../models/salesmanModel');
const Business = require('../../models/businessModel');

exports.getHoliday = async (req, res, next) => {
    try {
        const data = await Holiday.find({ company: req.manager?.company });

        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

exports.getCompanyInfo = async (req, res, next) => {
    try {
        const companyId = req.manager?.company;
        let [company, business] = await Promise.all([
            Company.findOne({ _id: companyId }).lean(),
            Business.findOne({ company: companyId }).lean(),
        ]);

        if (company) {
            company.salesman = undefined;
            company.role = undefined;
            company.manager = undefined;
            company.client = undefined;
            company.fcmToken = undefined;
            company.step = undefined;
            company.gender = undefined;
        }

        res.json({ success: true, data: { ...company, ...business } });
    } catch (error) {
        console.log('error: ', error);
        next(error);
    }
};

exports.getCompany = async (req, res, next) => {
    try {
        const data = await Business.find({ isDeleted: false })
            .select('businessName company')
            .populate('company', 'name');

        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};
