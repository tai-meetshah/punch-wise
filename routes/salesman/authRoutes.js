const router = require('express').Router();
const fileUpload = require('express-fileupload');

const { checkSalesman } = require('../../controllers/salesman/authController');
const authController = require('../../controllers/salesman/authController');

router.post('/send-signup-otp', fileUpload(), authController.sendRegisterOTP);

router.post(
    '/verify-signup-otp',
    fileUpload(),
    authController.verifyRegisterOTP
);

router.post('/resend-otp', fileUpload(), authController.resendOTP);

router.post('/login', fileUpload(), authController.login);

router.post('/forgot-password', fileUpload(), authController.forgotPassword);

router.post('/verify-otp', fileUpload(), authController.verifyOTP);

router.post('/reset-password', fileUpload(), authController.resetPassword);

router.get('/delete-account', checkSalesman, authController.deleteUser);

module.exports = router;
