const Manager = require('../../models/managerModel');
const { ManagerMessage } = require('../../models/messageModel');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await Manager.find({ isDeleted: false })
            .populate('company', 'name')
            .select('+blocked')
            .sort('-_id');

        res.render('manager', { users });
    } catch (error) {
        req.flash('red', error.message);
        res.redirect('/');
    }
};

exports.viewUser = async (req, res) => {
    try {
        const user = await Manager.findById(req.params.id).populate(
            'company',
            'name'
        );
        if (!user) {
            req.flash('red', 'Manager not found!');
            return res.redirect('/manager');
        }

        res.render('manager_view', { user });
    } catch (error) {
        if (error.name === 'CastError') req.flash('red', 'Manager not found!');
        else req.flash('red', error.message);
        res.redirect('/manager');
    }
};

exports.getAllMessages = async (req, res) => {
    try {
        const msgs = await ManagerMessage.find().sort('-_id');

        res.render('manager_message', { msgs });
    } catch (error) {
        req.flash('red', error.message);
        res.redirect('/');
    }
};

exports.viewMessages = async (req, res) => {
    try {
        const message = await ManagerMessage.findById(req.params.id);
        if (!message) {
            req.flash('red', 'Message not found!');
            return res.redirect('/message-manager');
        }

        res.render('manager_message_view', { message });
    } catch (error) {
        if (error.name === 'CastError') req.flash('red', 'Message not found!');
        else req.flash('red', error.message);
        res.redirect('/message-manager');
    }
};

exports.getDeleteMessages = async (req, res) => {
    try {
        await ManagerMessage.findByIdAndDelete(req.params.id);

        req.flash('green', 'Message deleted successfully.');
        res.redirect('/message-manager');
    } catch (error) {
        if (error.name === 'CastError' || error.name === 'TypeError')
            req.flash('red', 'Message not found!');
        else req.flash('red', error.message);
        res.redirect('/message-manager');
    }
};

exports.blockUser = async (req, res) => {
    try {
        const user = await Manager.findByIdAndUpdate(
            req.params.id,
            { blocked: true },
            { strict: false }
        );
        req.flash('green', `'${user.name}' blocked successfully.`);
        res.redirect('/manager');
    } catch (error) {
        if (error.name === 'CastError' || error.name === 'TypeError')
            req.flash('red', 'Manager not found!');
        else req.flash('red', error.message);
        res.redirect('/manager');
    }
};

exports.unblockUser = async (req, res) => {
    try {
        const user = await Manager.findByIdAndUpdate(
            req.params.id,
            { blocked: false },
            { strict: false }
        );
        req.flash('green', `'${user.name}' unblocked successfully.`);
        res.redirect('/manager');
    } catch (error) {
        if (error.name === 'CastError' || error.name === 'TypeError')
            req.flash('red', 'Manager not found!');
        else req.flash('red', error.message);
        res.redirect('/manager');
    }
};

exports.getDeleteUser = async (req, res) => {
    try {
        const user = await Manager.findByIdAndUpdate(req.params.id, {
            isDeleted: true,
        });
        if (!user) {
            req.flash('red', 'Manager not found!');
            return res.redirect('/manager');
        }

        const suffix = uniqueSuffix();

        await Manager.findByIdAndUpdate(req.params.id, {
            phone: user.phone + `${suffix}`,
            email: user.email + `${suffix}`,
        });

        req.flash('green', 'Manager deleted successfully.');
        res.redirect('/manager');
    } catch (error) {
        if (error.name === 'CastError') req.flash('red', 'Manager not found!');
        else req.flash('red', error.message);
        res.redirect('/manager');
    }
};

const uniqueSuffix = () => {
    const random = Math.random().toString(36).substr(2, 3);
    return `_deleted_${random}`;
};
