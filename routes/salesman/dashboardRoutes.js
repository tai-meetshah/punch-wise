const router = require('express').Router();
const fileUpload = require('express-fileupload');

const { checkSalesman } = require('../../controllers/salesman/authController');
const { upload } = require('../../controllers/uploadController');
const dashboardController = require('../../controllers/salesman/dashboardController');

router.get('/get-profile', checkSalesman, dashboardController.getProfile);

router.post(
    '/edit-profile',
    checkSalesman,
    upload.single('photo'),
    dashboardController.editProfile
);

router.post(
    '/change-password-check',
    fileUpload(),
    checkSalesman,
    dashboardController.changePasswordCheck
);

router.post(
    '/change-password',
    fileUpload(),
    checkSalesman,
    dashboardController.changePassword
);

module.exports = router;
