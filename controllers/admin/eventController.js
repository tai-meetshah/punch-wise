const Event = require('../../models/eventModel');
const Vendor = require('../../models/vendorModel');
const generateCode = require('../../utils/generateCode');

exports.getEvents = async (req, res) => {
    try {
        const events = await Event.find().sort('-_id');

        res.render('event', { events });
    } catch (error) {
        req.flash('red', error.message);
        res.redirect('/');
    }
};

exports.getAddEvent = (req, res) => {
    try {
        res.render('event_add');
    } catch (error) {}
};

exports.postAddEvent = async (req, res) => {
    try {
        const eventCode = generateCode(9);

        await Event.create({
            name: req.body.name,
            eventCode: eventCode,
            location: req.body.location,
            startTime: req.body.startTime,
            endTime: req.body.endTime,
        });

        req.flash('green', 'Event added successfully.');
        res.redirect('/event');
    } catch (error) {
        req.flash('red', error.message);
        res.redirect('/event');
    }
};

exports.getEditEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            req.flash('red', 'Event not found!');
            return res.redirect('/event');
        }

        res.render('event_edit', { event });
    } catch (error) {
        if (error.name === 'CastError') req.flash('red', 'Event not found!');
        else req.flash('red', error.message);
        res.redirect('/event');
    }
};

exports.postEditEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            req.flash('red', 'Event not found!');
            return res.redirect('/event');
        }

        event.name = req.body.name;
        event.location = req.body.location;
        event.startTime = req.body.startTime;
        event.endTime = req.body.endTime;

        await event.save();

        req.flash('green', 'Event updated successfully.');
        res.redirect('/event');
    } catch (error) {
        req.flash('red', error.message);
        res.redirect('/event');
    }
};

exports.getEvent = async (req, res) => {
    try {
        const [event, vendor] = await Promise.all([
            Event.findById(req.params.id).lean(),
            Vendor.find({ event: req.params.id })
                .select('name email photo')
                .lean(),
        ]);
        if (!event) {
            req.flash('red', 'Event not found!');
            return res.redirect('/event');
        }

        res.render('event_view', { event, vendor });
    } catch (error) {
        if (error.name === 'CastError') req.flash('red', 'event not found!');
        else req.flash('red', error.message);
        res.redirect('/event');
    }
};
