const router = require('express').Router();
const fileUpload = require('express-fileupload');

const { checkCompany } = require('../../controllers/company/authController');
const { upload } = require('../../controllers/uploadController');
const dashboardController = require('../../controllers/company/dashboardController');

router.get('/get-profile', checkCompany, dashboardController.getProfile);

router.post(
    '/edit-profile',
    checkCompany,
    upload.single('photo'),
    dashboardController.editProfile
);

router.post(
    '/change-password-check',
    fileUpload(),
    checkCompany,
    dashboardController.changePasswordCheck
);

router.post(
    '/change-password',
    fileUpload(),
    checkCompany,
    dashboardController.changePassword
);

module.exports = router;
