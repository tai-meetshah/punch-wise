const Salesman = require('../../models/salesmanModel');
const { SalesmanMessage } = require('../../models/messageModel');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await Salesman.find({ isDeleted: false })
            .populate('company', 'name')
            .select('+blocked')
            .sort('-_id');

        res.render('salesman', { users });
    } catch (error) {
        req.flash('red', error.message);
        res.redirect('/');
    }
};

exports.viewUser = async (req, res) => {
    try {
        const user = await Salesman.findById(req.params.id).populate(
            'company',
            'name'
        );
        if (!user) {
            req.flash('red', 'Salesman not found!');
            return res.redirect('/salesman');
        }

        res.render('salesman_view', { user });
    } catch (error) {
        if (error.name === 'CastError') req.flash('red', 'Salesman not found!');
        else req.flash('red', error.message);
        res.redirect('/salesman');
    }
};

exports.getAllMessages = async (req, res) => {
    try {
        const msgs = await SalesmanMessage.find().sort('-_id');

        res.render('salesman_message', { msgs });
    } catch (error) {
        req.flash('red', error.message);
        res.redirect('/');
    }
};

exports.viewMessages = async (req, res) => {
    try {
        const message = await SalesmanMessage.findById(req.params.id);
        if (!message) {
            req.flash('red', 'Message not found!');
            return res.redirect('/message-salesman');
        }

        res.render('salesman_message_view', { message });
    } catch (error) {
        if (error.name === 'CastError') req.flash('red', 'Message not found!');
        else req.flash('red', error.message);
        res.redirect('/message-salesman');
    }
};

exports.getDeleteMessages = async (req, res) => {
    try {
        await SalesmanMessage.findByIdAndDelete(req.params.id);

        req.flash('green', 'Message deleted successfully.');
        res.redirect('/message-salesman');
    } catch (error) {
        if (error.name === 'CastError' || error.name === 'TypeError')
            req.flash('red', 'Message not found!');
        else req.flash('red', error.message);
        res.redirect('/message-salesman');
    }
};

exports.blockUser = async (req, res) => {
    try {
        const user = await Salesman.findByIdAndUpdate(
            req.params.id,
            { blocked: true },
            { strict: false }
        );
        req.flash('green', `'${user.name}' blocked successfully.`);
        res.redirect('/salesman');
    } catch (error) {
        if (error.name === 'CastError' || error.name === 'TypeError')
            req.flash('red', 'salesman not found!');
        else req.flash('red', error.message);
        res.redirect('/salesman');
    }
};

exports.unblockUser = async (req, res) => {
    try {
        const user = await Salesman.findByIdAndUpdate(
            req.params.id,
            { blocked: false },
            { strict: false }
        );
        req.flash('green', `'${user.name}' unblocked successfully.`);
        res.redirect('/salesman');
    } catch (error) {
        if (error.name === 'CastError' || error.name === 'TypeError')
            req.flash('red', 'salesman not found!');
        else req.flash('red', error.message);
        res.redirect('/salesman');
    }
};

exports.getDeleteUser = async (req, res) => {
    try {
        const user = await Salesman.findByIdAndUpdate(req.params.id, {
            isDeleted: true,
        });
        if (!user) {
            req.flash('red', 'salesman not found!');
            return res.redirect('/salesman');
        }

        const suffix = uniqueSuffix();

        await Salesman.findByIdAndUpdate(req.params.id, {
            phone: user.phone + `${suffix}`,
            email: user.email + `${suffix}`,
        });

        req.flash('green', 'Salesman deleted successfully.');
        res.redirect('/salesman');
    } catch (error) {
        if (error.name === 'CastError') req.flash('red', 'salesman not found!');
        else req.flash('red', error.message);
        res.redirect('/salesman');
    }
};

const uniqueSuffix = () => {
    const random = Math.random().toString(36).substr(2, 3);
    return `_deleted_${random}`;
};
