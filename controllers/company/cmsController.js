const Page = require('../../models/pageModel');
const Contact = require('../../models/contactModel');
const { SalesmanFAQ } = require('../../models/faqsModel');
const { CompanyMessage } = require('../../models/messageModel');
const msg = require('../../utils/message.json');

exports.getTermsCondition = async (req, res, next) => {
    try {
        let page = await Page.findOne({ key: 'termsConditions' }).select(
            '-__v -key -_id -createdAt -updatedAt'
        );

        res.json({ success: true, page });
    } catch (error) {
        next(error);
    }
};

exports.getAbout = async (req, res, next) => {
    try {
        let page = await Page.findOne({ key: 'about' }).select(
            '-__v -key -_id  -createdAt -updatedAt'
        );

        res.json({ success: true, page });
    } catch (error) {
        next(error);
    }
};

exports.getPrivacy = async (req, res, next) => {
    try {
        let page = await Page.findOne({ key: 'privacy' }).select(
            '-__v -key -_id -createdAt -updatedAt'
        );

        res.json({ success: true, page });
    } catch (error) {
        next(error);
    }
};

exports.getContact = async (req, res, next) => {
    try {
        const contact = await Contact.findOne().select(
            '-_id -__v -createdAt -updatedAt'
        );

        res.json({ success: true, contact });
    } catch (error) {
        next(error);
    }
};

exports.postContact = async (req, res, next) => {
    try {
        await CompanyMessage.create(req.body);
        res.status(201).json({ success: true, message: msg.success.msg });
    } catch (error) {
        next(error);
    }
};

exports.getFAQs = async (req, res, next) => {
    try {
        let faqs = await SalesmanFAQ.find().sort('-_id').select('-__v');
        res.json({ success: true, faqs });
    } catch (error) {
        next(error);
    }
};
