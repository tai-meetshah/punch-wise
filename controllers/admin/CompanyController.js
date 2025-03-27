const Company = require('../../models/companyModel');
const { CompanyMessage } = require('../../models/messageModel');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await Company.find({ isDeleted: false })
            .populate('company', 'name')
            .select('+blocked')
            .sort('-_id');

        res.render('company', { users });
    } catch (error) {
        req.flash('red', error.message);
        res.redirect('/');
    }
};

exports.viewUser = async (req, res) => {
    try {
        const user = await Company.findById(req.params.id).populate(
            'company',
            'name'
        );
        if (!user) {
            req.flash('red', 'Company not found!');
            return res.redirect('/company');
        }

        res.render('company_view', { user });
    } catch (error) {
        if (error.name === 'CastError') req.flash('red', 'Company not found!');
        else req.flash('red', error.message);
        res.redirect('/company');
    }
};

exports.getAllMessages = async (req, res) => {
    try {
        const msgs = await CompanyMessage.find().sort('-_id');

        res.render('company_message', { msgs });
    } catch (error) {
        req.flash('red', error.message);
        res.redirect('/');
    }
};

exports.viewMessages = async (req, res) => {
    try {
        const message = await CompanyMessage.findById(req.params.id);
        if (!message) {
            req.flash('red', 'Message not found!');
            return res.redirect('/message-company');
        }

        res.render('company_message_view', { message });
    } catch (error) {
        if (error.name === 'CastError') req.flash('red', 'Message not found!');
        else req.flash('red', error.message);
        res.redirect('/message-company');
    }
};

exports.getDeleteMessages = async (req, res) => {
    try {
        await CompanyMessage.findByIdAndDelete(req.params.id);

        req.flash('green', 'Message deleted successfully.');
        res.redirect('/message-company');
    } catch (error) {
        if (error.name === 'CastError' || error.name === 'TypeError')
            req.flash('red', 'Message not found!');
        else req.flash('red', error.message);
        res.redirect('/message-company');
    }
};
// 9714140400
exports.blockUser = async (req, res) => {
    try {
        const user = await Company.findByIdAndUpdate(
            req.params.id,
            { blocked: true },
            { strict: false }
        );
        req.flash('green', `'${user.name}' blocked successfully.`);
        res.redirect('/company');
    } catch (error) {
        if (error.name === 'CastError' || error.name === 'TypeError')
            req.flash('red', 'Company not found!');
        else req.flash('red', error.message);
        res.redirect('/company');
    }
};

exports.unblockUser = async (req, res) => {
    try {
        const user = await Company.findByIdAndUpdate(
            req.params.id,
            { blocked: false },
            { strict: false }
        );
        req.flash('green', `'${user.name}' unblocked successfully.`);
        res.redirect('/company');
    } catch (error) {
        if (error.name === 'CastError' || error.name === 'TypeError')
            req.flash('red', 'Company not found!');
        else req.flash('red', error.message);
        res.redirect('/company');
    }
};

exports.getDeleteUser = async (req, res) => {
    try {
        const user = await Company.findByIdAndUpdate(req.params.id, {
            isDeleted: true,
        });
        if (!user) {
            req.flash('red', 'Company not found!');
            return res.redirect('/company');
        }

        const suffix = uniqueSuffix();

        await Company.findByIdAndUpdate(req.params.id, {
            phone: user.phone + `${suffix}`,
            email: user.email + `${suffix}`,
        });

        req.flash('green', 'Company deleted successfully.');
        res.redirect('/company');
    } catch (error) {
        if (error.name === 'CastError') req.flash('red', 'Company not found!');
        else req.flash('red', error.message);
        res.redirect('/company');
    }
};

const uniqueSuffix = () => {
    const random = Math.random().toString(36).substr(2, 3);
    return `_deleted_${random}`;
};
