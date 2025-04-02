const router = require('express').Router();
const fileUpload = require('express-fileupload');

const { checkCompany } = require('../../controllers/company/authController');
const authController = require('../../controllers/company/authController');
const { upload } = require('../../controllers/uploadController');

router.post('/send-signup-otp', fileUpload(), authController.sendRegisterOTP);

router.post(
    '/verify-signup-otp',
    fileUpload(),
    authController.verifyRegisterOTP
);

router.post('/create-pin', fileUpload(), authController.createPin);

router.route('/create-profile').post(
    upload.fields([
        // { name: 'idProof', maxCount: 1 },
        { name: 'photo', maxCount: 1 },
        // { name: 'certificate', maxCount: 1 },
    ]),
    checkCompany,
    authController.createProfile
);

router
    .route('/create-business')
    .post(fileUpload(), checkCompany, authController.createBusiness);

router.route('/add-business-images').post(
    upload.fields([
        { name: 'businessLogo', maxCount: 1 },
        { name: 'businessSupportDoc', maxCount: 1 },
        { name: 'businessLicense', maxCount: 1 },
        { name: 'businessTin', maxCount: 1 },
    ]),
    checkCompany,
    authController.addBusinessImages
);

router.post('/resend-otp', fileUpload(), authController.resendOTP);

router.post('/login-check', fileUpload(), authController.loginPhoneCheck);

router.post('/login', fileUpload(), authController.login);

router.post('/forgot-password', fileUpload(), authController.forgotPassword);

router.post('/verify-otp', fileUpload(), authController.verifyOTP);

router.post('/reset-password', fileUpload(), authController.resetPassword);

router.get('/delete-account', checkCompany, authController.deleteUser);

module.exports = router;
