const router = require('express').Router();
const fileUpload = require('express-fileupload');

const { checkSalesman } = require('../../controllers/salesman/authController');
const { upload } = require('../../controllers/uploadController');
const otherController = require('../../controllers/salesman/otherController');

router.get('/get-holiday', checkSalesman, otherController.getHoliday);
router.get('/get-company-info', checkSalesman, otherController.getCompanyInfo);
router.get('/get-company', checkSalesman, otherController.getCompany);

module.exports = router;
