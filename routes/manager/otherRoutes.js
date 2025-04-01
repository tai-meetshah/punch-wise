const router = require('express').Router();
const fileUpload = require('express-fileupload');

const { checkManager } = require('../../controllers/manager/authController');
const { upload } = require('../../controllers/uploadController');
const otherController = require('../../controllers/manager/otherController');

router.get('/get-holiday', checkManager, otherController.getHoliday);

module.exports = router;
