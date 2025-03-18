const router = require('express').Router();
const fileUpload = require('express-fileupload');

const { checkSalesman } = require('../../controllers/salesman/authController');
const { upload } = require('../../controllers/uploadController');
const leaveController = require('../../controllers/salesman/leaveController');

router.get('/get-profile', checkSalesman, dashboardController.getProfile);

router.post(
    '/edit-profile',
    checkSalesman,
    upload.single('photo'),
    dashboardController.editProfile
);

router.post(
    '/change-password',
    fileUpload(),
    checkSalesman,
    dashboardController.changePassword
);

module.exports = router;
