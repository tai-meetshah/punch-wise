const jwt = require('jsonwebtoken');
const createError = require('http-errors');
const generateCode = require('../../utils/generateCode');
const message = require('../../utils/message.json');
const { sendOtp, sendVerificationEmail } = require('../../utils/sendMail');
const parseOpeningHours = require('../../utils/parseOpeningHours');

const Company = require('../../models/companyModel');
const Business = require('../../models/businessModel');
const { CompanyOTP } = require('../../models/otpModel');

// To ensure that a valid user is logged in.
exports.checkCompany = async (req, res, next) => {
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

        const user = await Company.findById(decoded._id).select(
            '+password +blocked'
        );

        if (!user) return next(createError.Unauthorized(message.error.login));
        if (user.blocked)
            return next(createError.Unauthorized(message.error.blocked));
        if (user.isDeleted)
            return next(createError.Unauthorized(message.error.deleted));

        req.company = user;
        next();
    } catch (error) {
        next(error);
    }
};

// Just check if valid user is logged, doesn't throw error if not
exports.isCompany = async (req, res, next) => {
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

        const user = await Company.findById(decoded._id).select('+password');

        if (user) req.company = user;

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

        const userExist = await Company.findOne({
            phone: phone,
        });
        if (userExist)
            return next(
                createError.BadRequest(message.error.alreadyRegistered)
            );

        const otp = generateCode(4);
        await CompanyOTP.updateOne(
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
        let otp = await CompanyOTP.findOne({ phone });

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

        const user = await Company.create({
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
        const company = req.company;

        company.step = 1;
        company.name = req.body.name;
        company.dob = req.body.dob;
        company.gender = req.body.gender;
        company.address = req.body.address;
        company.city = req.body.city;
        company.state = req.body.state;
        company.email = req.body.email;
        company.company = req.body.company;
        company.employeeType = req.body.employeeType;

        company.photo = req.files.photo
            ? `/uploads/${req.files.photo[0].filename}`
            : '';

        await company.save();

        company.password = undefined;
        company.isDeleted = undefined;
        company.date = undefined;
        company.blocked = undefined;
        company.__v = undefined;

        res.json({
            success: true,
            message: 'company profile created sucessfully.',
            step: 1,
            company,
        });
    } catch (error) {
        console.log('error: ', error);
        next(error);
    }
};

// step 5
exports.createBusiness = async (req, res, next) => {
    try {
        const company = req.company;

        const business = await Business.create({
            company: company.id,
            businessName: req.body.businessName,
            businessRegistrationType: req.body.businessRegistrationType,
            businessCategory: req.body.businessCategory,

            yearEstablish: req.body.yearEstablish,
            workingHours: {
                from: req.body['workingHours[from]'],
                to: req.body['workingHours[to]'],
            },
            workingDays: req.body.workingDays?.split(',').map(x => x.trim()),
            // .split(",") → Converts a string into an array (✅ Useful for your case)
            // .join(",") → Converts an array into a string (❌ Not what you need here)

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

        company.step = 2;
        await company.save();

        res.json({
            success: true,
            step: 2,
            message: 'Business created sucessfully.',
            business,
        });
    } catch (error) {
        next(error);
    }
};

// step 6
exports.addBusinessImages = async (req, res, next) => {
    try {
        const company = req.company;
        const businessID = await Business.findOne({ company }).select('id');

        const businessLogo = req.files
            ? `/uploads/${req.files.businessLogo[0].filename}`
            : undefined;
        const businessSupportDoc = req.files
            ? `/uploads/${req.files.businessSupportDoc[0].filename}`
            : undefined;
        const businessLicense = req.files
            ? `/uploads/${req.files.businessLicense[0].filename}`
            : undefined;
        const businessTin = req.files
            ? `/uploads/${req.files.businessTin[0].filename}`
            : undefined;

        const business = await Business.findByIdAndUpdate(
            businessID,
            {
                businessLogo,
                businessSupportDoc,
                businessLicense,
                businessTin,
                step: 3,
            },
            { new: true }
        ).select('-__v -updatedAt');

        company.step = 3;
        await company.save();

        res.json({
            success: true,
            step: 3,
            message: 'Business images added sucessfully.',
            business,
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

        await CompanyOTP.updateOne(
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

        const user = await Company.findOne({ phone });
        if (!user) return next(createError.BadRequest('Company not found.'));

        res.json({
            success: true,
            message: 'Company verified.',
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

        const user = await Company.findOne({
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
            company: user,
        });
    } catch (error) {
        next(error);
    }
};

exports.forgotPassword = async (req, res, next) => {
    try {
        const user = await Company.findOne({ phone: req.body.phone.trim() });
        if (!user)
            return next(createError.NotFound(message.error.notRegisteredPhone));

        const otp = generateCode(4);
        await CompanyOTP.updateOne(
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
        let otp = await CompanyOTP.findOne({ phone });
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

        const user = await Company.findOne({ phone: decoded.phone });
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
        const user = await Company.findByIdAndUpdate(req.company.id, {
            isDeleted: true,
        });
        if (!user) return next(createError.Unauthorized('Company not found!'));

        const suffix = uniqueSuffix();

        await Company.findByIdAndUpdate(req.params.id, {
            email: user.email + `${suffix}`,
            name: user.name + `${suffix}`,
        });

        res.json({
            success: true,
            message: 'Company deleted successfully.',
        });
    } catch (error) {
        if (error.name == 'CastError')
            return next(createError.NotFound('Company not found.'));
        next(error);
    }
};

const uniqueSuffix = () => {
    const random = Math.random().toString(36).substr(2, 3);
    return `_deleted_${random}`;
};
