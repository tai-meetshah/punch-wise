const Holiday = require('../../models/holidayModel');
const Client = require('../../models/clientModel');

exports.addHoliday = async (req, res, next) => {
    try {
        const data = await Holiday.create({
            company: req.company.id,
            date: req.body.date,
            name: req.body.name,
        });

        res.status(201).json({
            success: true,
            message: 'Holiday created successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
};

exports.getHoliday = async (req, res, next) => {
    try {
        const data = await Holiday.find({ company: req.company.id });
        if (!data || data.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Holiday not found',
            });
        }

        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

exports.editHoliday = async (req, res, next) => {
    try {
        const { name, date, holidayId } = req.body;

        const data = await Holiday.findByIdAndUpdate(
            holidayId,
            {
                name,
                date,
            },
            {
                new: true,
                runValidators: true,
            }
        );

        res.json({
            success: true,
            message: 'Holiday updated succefully',
            data,
        });
    } catch (error) {
        next(error);
    }
};

exports.getClient = async (req, res, next) => {
    try {
        const data = await Client.find({ company: req.company.id }).populate(
            'manager',
            'name'
        );
        if (!data || data.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Client not found.',
            });
        }

        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

exports.addClient = async (req, res, next) => {
    try {
        const data = await Client.create({
            company: req.company.id,
            name: req.body.name,
            manager: req.body.manager,
            email: req.body.email,
            phone: req.body.phone,

            dob: req.body.dob,
            gender: req.body.gender,
            address: req.body.address,
            city: req.body.city,
            state: req.body.state,

            businessName: req.body.businessName,
            businessRegistrationType: req.body.businessRegistrationType,
            businessCategory: req.body.businessCategory,
            businessWebsite: req.body.businessWebsite,
            businessPhone: req.body.businessPhone,
            businessAlternatePhone: req.body.businessAlternatePhone,
            businessEmail: req.body.businessEmail,
            businessAddress: req.body.businessAddress,
            businessCity: req.body.businessCity,
            businessState: req.body.businessState,
            businessCountry: req.body.businessCountry,
            businessPincode: req.body.businessPincode,
        });

        res.status(201).json({
            success: true,
            message: 'Client created successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
};

//! postman testing pendin
exports.editClient = async (req, res, next) => {
    try {
        const { clientid } = req.body;

        const data = await Client.findByIdAndUpdate(clientid, req.body, {
            new: true,
            runValidators: true,
        });

        res.json({
            success: true,
            message: 'Client updated succefully',
            data,
        });
    } catch (error) {
        next(error);
    }
};
//! postman testing pendin

exports.updateClientStatus = async (req, res, next) => {
    try {
        const { status, clientid } = req.body;

        if (!['Active', 'Inactive'].includes(status))
            return res.status(400).json({
                success: false,
                message: "Invalid status. Allowed values: 'Active', 'Inactive'",
            });

        const data = await Client.findByIdAndUpdate(
            clientid,
            {
                status,
            },
            {
                new: true,
                runValidators: true,
            }
        );

        res.json({
            success: true,
            message: 'Client status updated succefully',
            data,
        });
    } catch (error) {
        next(error);
    }
};
