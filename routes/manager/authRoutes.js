const router = require('express').Router();
const fileUpload = require('express-fileupload');
const { upload } = require('../../controllers/uploadController');
const { checkVendor } = require('../../controllers/manager/authController');

const authController = require('../../controllers/manager/authController');



module.exports = router;
