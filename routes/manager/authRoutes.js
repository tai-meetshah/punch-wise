const router = require('express').Router();
const fileUpload = require('express-fileupload');

const { checkManager } = require('../../controllers/manager/authController');
const authController = require('../../controllers/manager/authController');
const { upload } = require('../../controllers/uploadController');

router.post('/send-signup-otp', fileUpload(), authController.sendRegisterOTP);

router.post(
    '/verify-signup-otp',
    fileUpload(),
    authController.verifyRegisterOTP
);

router.post(
    '/create-pin',
    fileUpload(),
    authController.createPin
);

router.route('/create-profile').post(
    upload.fields([
        { name: 'idProof', maxCount: 1 },
        { name: 'certificate', maxCount: 1 },
    ]),
    checkManager,
    authController.createProfile
);

router.post('/resend-otp', fileUpload(), authController.resendOTP);

router.post('/login-check', fileUpload(), authController.loginPhoneCheck);

router.post('/login', fileUpload(), authController.login);

router.post('/forgot-password', fileUpload(), authController.forgotPassword);

router.post('/verify-otp', fileUpload(), authController.verifyOTP);

router.post('/reset-password', fileUpload(), authController.resetPassword);

router.get('/delete-account', checkManager, authController.deleteUser);

module.exports = router;
