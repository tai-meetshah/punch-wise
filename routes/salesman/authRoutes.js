const router = require('express').Router();
const fileUpload = require('express-fileupload');

const { checkSalesman } = require('../../controllers/salesman/authController');
const authController = require('../../controllers/salesman/authController');
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
        { name: 'idProof', maxCount: 1 },
        { name: 'photo', maxCount: 1 },
        { name: 'certificate', maxCount: 1 },
    ]),
    checkSalesman,
    authController.createProfile
);

router.post('/resend-otp', fileUpload(), authController.resendOTP);

router.post('/login-check', fileUpload(), authController.loginPhoneCheck);

router.post('/login', fileUpload(), authController.login);

router.post('/forgot-password', fileUpload(), authController.forgotPassword);

router.post('/verify-otp', fileUpload(), authController.verifyOTP);

router.post('/reset-password', fileUpload(), authController.resetPassword);

router.get('/delete-account', checkSalesman, authController.deleteUser);

module.exports = router;
