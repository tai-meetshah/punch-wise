const jwt = require('jsonwebtoken');
const createError = require('http-errors');
const generateCode = require('../../utils/generateCode');
const message = require('../../utils/message.json');
const { sendOtp, sendVerificationEmail } = require('../../utils/sendMail');

const Salesman = require('../../models/salesmanModel');
const { SalesmanOTP } = require('../../models/otpModel');

// To ensure that a valid user is logged in.
exports.checkSalesman = async (req, res, next) => {
    try {
        const token = req.headers['authorization'];

        if (!token)
            return next(createError.Unauthorized(message.error.provideToken));

        const decoded = await jwt.verify(token, process.env.JWT_SECRET);

        const user = await Salesman.findById(decoded._id).select(
            '+password +blocked'
        );

        if (!user) return next(createError.Unauthorized(message.error.login));
        if (user.blocked)
            return next(createError.Unauthorized(message.error.blocked));
        if (user.isDeleted)
            return next(createError.Unauthorized(message.error.deleted));

        req.salesman = user;
        next();
    } catch (error) {
        next(error);
    }
};

// Just check if valid user is logged, doesn't throw error if not
exports.isSalesman = async (req, res, next) => {
    try {
        const token = req.headers['authorization'];

        if (!token) return next();

        const decoded = await jwt.verify(token, process.env.JWT_SECRET);

        const user = await Salesman.findById(decoded._id).select('+password');

        if (user) req.salesman = user;

        next();
    } catch (error) {
        next();
    }
};

exports.sendRegisterOTP = async (req, res, next) => {
    try {
        let { name, email } = req.body;

        name = name?.toLowerCase().trim();
        email = email?.trim();

        const userExist = await Salesman.findOne({
            $or: [{ name }, { email }],
        });

        if (userExist) {
            if (userExist.name === name) {
                return next(
                    createError.Conflict(message.error.alreadyRegisteredUser)
                );
            } else {
                return next(
                    createError.Conflict(message.error.alreadyRegistered)
                );
            }
        }

        const otp = generateCode(4);
        await SalesmanOTP.updateOne(
            { email },
            { otp, createdAt: Date.now() + 5 * 60 * 1000 },
            { upsert: true }
        );

        //! set CLIENT_URL in env
        sendVerificationEmail(email, otp);

        res.json({
            success: true,
            message: message.error.otpSentEmail,
            otp, //! Remove otp
        });
    } catch (error) {
        next(error);
    }
};

exports.verifyRegisterOTP = async (req, res, next) => {
    try {
        const email = req.body.email.trim();
        let otp = await SalesmanOTP.findOne({ email });
        if (!otp || otp.otp != req.body.otp)
            return next(createError.BadRequest(message.error.otpFail));

        const user = await Salesman.create({
            name: req.body.name,
            email: email,
            password: req.body.password,
            fcmToken: req.body.fcmToken,
        });

        const userData = {
            _id: user._id,
            name: user.name,
            email: user.email,
            fcmToken: user.fcmToken,
        };

        const token = user.generateAuthToken();

        res.status(201).json({
            success: true,
            message: message.success.registerSuccefully,
            token,
            user: userData,
        });
    } catch (error) {
        next(error);
    }
};

exports.resendOTP = async (req, res, next) => {
    try {
        let { email } = req.body;
        if (!email)
            return next(
                createError.BadRequest('Please provide an email address.')
            );

        email = email.trim();

        const otp = generateCode(4);

        await SalesmanOTP.updateOne(
            { email },
            { otp, createdAt: Date.now() + 5 * 60 * 1000 },
            { upsert: true }
        );

        sendVerificationEmail(email, otp);

        res.json({
            success: true,
            message: 'OTP resent successfully.',
            otp,
        });
    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        let { name, password } = req.body;
        if (!name || !password)
            return next(createError.BadRequest(message.error.namePassword));

        name = name.toLowerCase().trim();

        const user = await Salesman.findOne({
            $or: [{ email: name }, { name }],
        }).select('+password +isDeleted');

        if (!user || !(await user.correctPassword(password, user.password)))
            return next(createError.BadRequest(message.error.credentials));

        if (user.isDeleted)
            return next(createError.Unauthorized(message.error.deleted));

        const token = user.generateAuthToken();

        user.fcmToken = req.body.fcmToken;
        await user.save();

        user.password = undefined;
        user.favourites = undefined;
        user.date = undefined;
        user.__v = undefined;

        res.json({
            success: true,
            message: message.success.loginSuccefully,
            token,
            user,
        });
    } catch (error) {
        next(error);
    }
};

exports.forgotPassword = async (req, res, next) => {
    try {
        const user = await Salesman.findOne({ email: req.body.email.trim() });
        if (!user)
            return next(createError.NotFound(message.error.notRegistered));

        const otp = generateCode(4);
        await SalesmanOTP.updateOne(
            { email: user.email },
            { otp, createdAt: Date.now() + 5 * 60 * 1000 },
            { upsert: true }
        );

        //! set CLIENT_URL in env
        sendOtp(user.email, otp);

        res.json({
            success: true,
            message: message.error.otpSentEmail,
            otp, //! Remove otp
        });
    } catch (error) {
        next(error);
    }
};

exports.verifyOTP = async (req, res, next) => {
    try {
        const email = req.body.email.trim();

        // check otp
        let otp = await SalesmanOTP.findOne({ email });
        if (!otp || otp.otp != req.body.otp)
            return next(createError.BadRequest(message.error.otpFail));

        // generate verifyToken
        const verifyToken = jwt.sign({ email }, process.env.JWT_SECRET, {
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
        if (!decoded.email)
            return next(createError.BadRequest('Invalid token.'));

        const user = await Salesman.findOne({ email: decoded.email });
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
        const user = await Salesman.findByIdAndUpdate(req.salesman.id, {
            isDeleted: true,
        });
        if (!user) return next(createError.Unauthorized('Salesman not found!'));

        const suffix = uniqueSuffix();

        await Salesman.findByIdAndUpdate(req.params.id, {
            email: user.email + `${suffix}`,
            name: user.name + `${suffix}`,
        });

        res.json({
            success: true,
            message: 'Salesman deleted successfully.',
        });
    } catch (error) {
        if (error.name == 'CastError')
            return next(createError.NotFound('Salesman not found.'));
        next(error);
    }
};

const uniqueSuffix = () => {
    const random = Math.random().toString(36).substr(2, 3);
    return `_deleted_${random}`;
};
