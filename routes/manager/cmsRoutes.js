const router = require('express').Router();
const fileUpload = require('express-fileupload');
const cmsController = require('../../controllers/manager/cmsController');

router.get('/faq', cmsController.getFAQs);

router
    .route('/contact')
    .get(cmsController.getContact)
    .post(fileUpload(), cmsController.postContact);

module.exports = router;
