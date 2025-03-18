const jwt = require('jsonwebtoken');
const createError = require('http-errors');
const generateCode = require('../../utils/generateCode');
const message = require('../../utils/message.json');
const { sendOtp, sendVerificationEmail } = require('../../utils/sendMail');

const Manager = require('../../models/managerModel');
const { ManagerOTP } = require('../../models/otpModel');

exports.checkManager = async (req, res, next) => {
    try {
        let token = req.headers['authorization'];
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token)
            return next(createError.Unauthorized(message.error.provideToken));

        const decoded = await jwt.verify(token, process.env.JWT_SECRET);

        const user = await Manager.findById(decoded._id).select(
            '+password +blocked'
        );

        if (!user) return next(createError.Unauthorized(message.error.login));
        if (user.blocked)
            return next(createError.Unauthorized(message.error.blocked));
        if (user.isDeleted)
            return next(createError.Unauthorized(message.error.deleted));

        req.manager = user;
        next();
    } catch (error) {
        next(error);
    }
};

exports.isManager = async (req, res, next) => {
    try {
        let token = req.headers['authorization'];
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) return next();

        const decoded = await jwt.verify(token, process.env.JWT_SECRET);

        const user = await Manager.findById(decoded._id).select('+password');

        if (user) req.manager = user;

        next();
    } catch (error) {
        next();
    }
};

// step 1
exports.sendRegisterOTP = async (req, res, next) => {
    try {
        let { phone } = req.body;
        if (!phone) return next(createError.BadRequest('please enter phone.'));

        const userExist = await Manager.findOne({
            phone: phone,
        });
        if (userExist)
            return next(
                createError.BadRequest(message.error.alreadyRegistered)
            );

        const otp = generateCode(4);
        await ManagerOTP.updateOne(
            { phone },
            { otp, createdAt: Date.now() + 5 * 60 * 1000 },
            { upsert: true }
        );

        //! set CLIENT_URL in env
        // sendVerificationEmail(phone, otp);

        res.json({
            success: true,
            message: message.error.otpSentPhone,
            otp, //! Remove otp
        });
    } catch (error) {
        next(error);
    }
};

// step 2
exports.verifyRegisterOTP = async (req, res, next) => {
    try {
        const phone = req.body.phone.trim();
        let otp = await ManagerOTP.findOne({ phone });

        if (!otp || otp.otp != req.body.otp)
            return next(createError.BadRequest(message.error.otpFail));

        const token = jwt.sign({ phone }, process.env.JWT_SECRET, {
            expiresIn: '1d',
        });

        res.status(201).json({
            success: true,
            message: 'OTP verify Succefully',
            token,
        });
    } catch (error) {
        next(error);
    }
};

// step 3
exports.createPin = async (req, res, next) => {
    try {
        const decoded = jwt.verify(
            req.body.verifyToken,
            process.env.JWT_SECRET
        );
        if (!decoded.phone)
            return next(createError.BadRequest('Invalid token.'));
        if (decoded.phone !== req.body.phone)
            return next(createError.BadRequest('Invalid token.'));

        const user = await Manager.create({
            phone: req.body.phone,
            password: req.body.password,
            fcmToken: req.body.fcmToken,
        });

        const token = user.generateAuthToken();

        res.json({
            success: true,
            message: 'PIN created successfully!',
            token,
        });
    } catch (error) {
        if (
            error.message == 'jwt expired' ||
            error.message == 'invalid signature'
        )
            return next(createError.BadRequest(message.error.tokenInvalid));
        next(error);
    }
};

// step 4
exports.createProfile = async (req, res, next) => {
    try {
        const manager = req.manager;

        manager.name = req.body.name;
        manager.dob = req.body.dob;
        manager.gender = req.body.gender;
        manager.address = req.body.address;
        manager.city = req.body.city;
        manager.state = req.body.state;
        manager.email = req.body.email;
        manager.company = req.body.company;
        manager.employeeType = req.body.employeeType;

        manager.idProof = req.files.idProof
            ? `/uploads/${req.files.idProof[0].filename}`
            : '';
        manager.certificate = req.files.certificate
            ? `/uploads/${req.files.certificate[0].filename}`
            : '';

        await manager.save();

        manager.password = undefined;
        manager.isDeleted = undefined;
        manager.date = undefined;
        manager.blocked = undefined;
        manager.__v = undefined;

        res.json({
            success: true,
            message: 'manager profile crated sucessfully.',
            manager,
        });
    } catch (error) {
        next(error);
    }
};

exports.resendOTP = async (req, res, next) => {
    try {
        let { phone } = req.body;
        if (!phone)
            return next(createError.BadRequest('Please provide phone number.'));

        phone = phone.trim();

        const otp = generateCode(4);

        await ManagerOTP.updateOne(
            { phone },
            { otp, createdAt: Date.now() + 5 * 60 * 1000 },
            { upsert: true }
        );

        // sendVerificationphone(phone, otp);

        res.json({
            success: true,
            message: 'OTP resent successfully.',
            otp,
        });
    } catch (error) {
        next(error);
    }
};

exports.loginPhoneCheck = async (req, res, next) => {
    try {
        const { phone } = req.body;
        if (!phone) return next(createError.BadRequest('Provide phone no.'));

        const user = await Manager.findOne({ phone });
        if (!user) return next(createError.BadRequest('Manager not found.'));

        res.json({
            success: true,
            message: 'Manager verified.',
        });
    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        let { phone, password } = req.body;
        if (!phone || !password)
            return next(createError.BadRequest(message.error.namePassword));

        phone = phone.trim();

        const user = await Manager.findOne({
            phone: phone,
        }).select('+password +isDeleted +blocked');

        if (!user || !(await user.correctPassword(password, user.password)))
            return next(createError.BadRequest(message.error.credentials));

        if (user.isDeleted)
            return next(createError.Unauthorized(message.error.deleted));
        if (user.blocked)
            return next(createError.Unauthorized(message.error.blocked));

        const token = user.generateAuthToken();

        user.fcmToken = req.body.fcmToken;
        await user.save();

        user.password = undefined;
        user.isDeleted = undefined;
        user.date = undefined;
        user.blocked = undefined;
        user.__v = undefined;

        res.json({
            success: true,
            message: message.success.loginSuccefully,
            token,
            manager: user,
        });
    } catch (error) {
        next(error);
    }
};

exports.forgotPassword = async (req, res, next) => {
    try {
        const user = await Manager.findOne({ phone: req.body.phone.trim() });
        if (!user)
            return next(createError.NotFound(message.error.notRegistered));

        const otp = generateCode(4);
        await ManagerOTP.updateOne(
            { phone: user.phone },
            { otp, createdAt: Date.now() + 5 * 60 * 1000 },
            { upsert: true }
        );

        //! set CLIENT_URL in env
        // sendOtp(user.phone, otp);

        res.json({
            success: true,
            message: message.error.otpSentPhone,
            otp, //! Remove otp
        });
    } catch (error) {
        next(error);
    }
};

exports.verifyOTP = async (req, res, next) => {
    try {
        const phone = req.body.phone.trim();

        // check otp
        let otp = await ManagerOTP.findOne({ phone });
        if (!otp || otp.otp != req.body.otp)
            return next(createError.BadRequest(message.error.otpFail));

        // generate verifyToken
        const verifyToken = jwt.sign({ phone }, process.env.JWT_SECRET, {
            expiresIn: '1d',
        });

        res.json({
            success: true,
            message: message.success.otpVerified,
            verifyToken,
        });
    } catch (error) {
        next(error);
    }
};

exports.resetPassword = async (req, res, next) => {
    try {
        const decoded = jwt.verify(
            req.body.verifyToken,
            process.env.JWT_SECRET
        );
        if (!decoded.phone)
            return next(createError.BadRequest('Invalid token.'));

        const user = await Manager.findOne({ phone: decoded.phone });
        if (!user) return next(createError.BadRequest('Invalid token.'));

        user.password = req.body.password;
        await user.save();

        res.json({
            success: true,
            message: message.success.passwordUpdated,
        });
    } catch (error) {
        if (
            error.message == 'jwt expired' ||
            error.message == 'invalid signature'
        )
            return next(createError.BadRequest(message.error.tokenInvalid));
        next(error);
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await Manager.findByIdAndUpdate(req.manager.id, {
            isDeleted: true,
        });
        if (!user) return next(createError.Unauthorized('Manager not found!'));

        const suffix = uniqueSuffix();

        await Manager.findByIdAndUpdate(req.params.id, {
            email: user.email + `${suffix}`,
            name: user.name + `${suffix}`,
        });

        res.json({
            success: true,
            message: 'Manager deleted successfully.',
        });
    } catch (error) {
        if (error.name == 'CastError')
            return next(createError.NotFound('Manager not found.'));
        next(error);
    }
};

const uniqueSuffix = () => {
    const random = Math.random().toString(36).substr(2, 3);
    return `_deleted_${random}`;
};
