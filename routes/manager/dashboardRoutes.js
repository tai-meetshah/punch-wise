const router = require('express').Router();
const fileUpload = require('express-fileupload');

const { checkManager } = require('../../controllers/manager/authController');
const { upload } = require('../../controllers/uploadController');
const dashboardController = require('../../controllers/manager/dashboardController');

router.get('/get-profile', checkManager, dashboardController.getProfile);

router.post(
    '/edit-profile',
    checkManager,
    upload.single('photo'),
    dashboardController.editProfile
);

router.post(
    '/change-password',
    fileUpload(),
    checkManager,
    dashboardController.changePassword
);

module.exports = router;
