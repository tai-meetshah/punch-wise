const Plan = require('../../models/planModel');

exports.getPlans = async (req, res) => {
    try {
        const plan = await Plan.find({ isDeleted: false }).sort('prize');

        res.render('plan', { plan });
    } catch (error) {
        req.flash('red', error.message);
        res.redirect('/');
    }
};

exports.getAddPlan = (req, res) => res.render('plan_add');

exports.postAddPlan = async (req, res) => {
    try {
        await Plan.create({
            name: req.body.name,
            offerCard: req.body.offerCard,
            prize: req.body.prize,
            colorCode: req.body.color,
        });

        req.flash('green', 'Subscription Plan added successfully.');
        res.redirect('/plan');
    } catch (error) {
        req.flash('red', error.message);
        res.redirect('/plan');
    }
};

exports.getEditPlan = async (req, res) => {
    try {
        const plan = await Plan.findById(req.params.id);
        if (!plan) {
            req.flash('red', 'Subscription Plan not found!');
            return res.redirect('/plan');
        }

        res.render('plan_edit', { plan });
    } catch (error) {
        if (error.name === 'CastError')
            req.flash('red', 'Subscription Plan not found!');
        else req.flash('red', error.message);
        res.redirect('/plan');
    }
};

exports.postEditPlan = async (req, res) => {
    try {
        const plan = await Plan.findById(req.params.id);
        if (!plan) {
            req.flash('red', 'Subscription Plan not found!');
            return res.redirect('/plan');
        }

        plan.name = req.body.name;
        plan.offerCard = req.body.offerCard;
        plan.prize = req.body.prize;
        plan.colorCode = req.body.color;

        await plan.save();

        req.flash('green', 'Subscription Plan updated successfully');
        res.redirect('/plan');
    } catch (error) {
        req.flash('red', error.message);
        res.redirect('/plan');
    }
};

exports.getDeletePlan = async (req, res) => {
    try {
        await Plan.findByIdAndUpdate(req.params.id, {
            isDeleted: true,
        });

        req.flash('green', 'Subscription Plan deleted successfully.');
        res.redirect('/plan');
    } catch (error) {
        if (error.name === 'CastError' || error.name === 'TypeError')
            req.flash('red', 'Subscription Plan not found!');
        else req.flash('red', error.message);
        res.redirect('/plan');
    }
};
