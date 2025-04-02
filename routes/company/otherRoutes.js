const router = require('express').Router();
const fileUpload = require('express-fileupload');

const { checkCompany } = require('../../controllers/company/authController');
const otherController = require('../../controllers/company/otherController');

router.get('/holiday-list', checkCompany, otherController.getHoliday);

router.post(
    '/add-holiday',
    checkCompany,
    fileUpload(),
    otherController.addHoliday
);

router.post(
    '/edit-holiday',
    fileUpload(),
    checkCompany,
    otherController.editHoliday
);

module.exports = router;
