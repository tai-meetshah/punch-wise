const router = require('express').Router();
const fileUpload = require('express-fileupload');

const { checkManager } = require('../../controllers/manager/authController');
const { upload } = require('../../controllers/uploadController');
const otherController = require('../../controllers/manager/otherController');

router.get('/get-holiday', checkManager, otherController.getHoliday);
router.get('/get-company-info', checkManager, otherController.getCompanyInfo);
router.get('/get-company', checkManager, otherController.getCompany);

module.exports = router;
