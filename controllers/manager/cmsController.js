const Contact = require('../../models/contactModel');
const { ManagerFAQ } = require('../../models/faqsModel');
const { ManagerMessage } = require('../../models/messageModel');
const msg = require('../../utils/message.json');

//* getTermsCondition are same for salseman and manager

exports.getFAQs = async (req, res, next) => {
    try {
        let faqs = await ManagerFAQ.find().sort('-_id').select('-__v');
        res.json({ success: true, faqs });
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
        await ManagerMessage.create(req.body);
        res.status(201).json({ success: true, message: msg.success.msg });
    } catch (error) {
        next(error);
    }
};
