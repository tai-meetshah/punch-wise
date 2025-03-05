const User = require('../../models/userModel');
const { UserMessage } = require('../../models/messageModel');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ isDeleted: false })
            .populate('event', 'name')
            .select('+blocked')
            .sort('-_id');

        res.render('user', { users });
    } catch (error) {
        req.flash('red', error.message);
        res.redirect('/');
    }
};

exports.viewUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate(
            'event',
            'name eventCode'
        );
        if (!user) {
            req.flash('red', 'User not found!');
            return res.redirect('/user');
        }

        res.render('user_view', { user });
    } catch (error) {
        if (error.name === 'CastError') req.flash('red', 'User not found!');
        else req.flash('red', error.message);
        res.redirect('/user');
    }
};

exports.getAllMessages = async (req, res) => {
    try {
        const msgs = await UserMessage.find().sort('-_id');

        res.render('user_message', { msgs });
    } catch (error) {
        req.flash('red', error.message);
        res.redirect('/');
    }
};

exports.viewMessages = async (req, res) => {
    try {
        const message = await UserMessage.findById(req.params.id);
        if (!message) {
            req.flash('red', 'Message not found!');
            return res.redirect('/message-user');
        }

        res.render('user_message_view', { message });
    } catch (error) {
        if (error.name === 'CastError') req.flash('red', 'Message not found!');
        else req.flash('red', error.message);
        res.redirect('/message-user');
    }
};

exports.getDeleteMessages = async (req, res) => {
    try {
        await UserMessage.findByIdAndDelete(req.params.id);

        req.flash('green', 'Message deleted successfully.');
        res.redirect('/message-user');
    } catch (error) {
        if (error.name === 'CastError' || error.name === 'TypeError')
            req.flash('red', 'Message not found!');
        else req.flash('red', error.message);
        res.redirect('/message-user');
    }
};

exports.blockUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { blocked: true },
            { strict: false }
        );
        req.flash('green', `'${user.name}' blocked successfully.`);
        res.redirect('/user');
    } catch (error) {
        if (error.name === 'CastError' || error.name === 'TypeError')
            req.flash('red', 'User not found!');
        else req.flash('red', error.message);
        res.redirect('/user');
    }
};

exports.unblockUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { blocked: false },
            { strict: false }
        );
        req.flash('green', `'${user.name}' unblocked successfully.`);
        res.redirect('/user');
    } catch (error) {
        if (error.name === 'CastError' || error.name === 'TypeError')
            req.flash('red', 'User not found!');
        else req.flash('red', error.message);
        res.redirect('/user');
    }
};

exports.getDeleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, {
            isDeleted: true,
        });
        if (!user) {
            req.flash('red', 'User not found!');
            return res.redirect('/merchant');
        }

        const suffix = uniqueSuffix();

        await User.findByIdAndUpdate(req.params.id, {
            email: user.email + `${suffix}`,
            name: user.name + `${suffix}`,
        });

        req.flash('green', 'User deleted successfully.');
        res.redirect('/user');
    } catch (error) {
        if (error.name === 'CastError') req.flash('red', 'User not found!');
        else req.flash('red', error.message);
        res.redirect('/user');
    }
};

const uniqueSuffix = () => {
    const random = Math.random().toString(36).substr(2, 3);
    return `_deleted_${random}`;
};
