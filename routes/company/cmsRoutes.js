const router = require('express').Router();
const fileUpload = require('express-fileupload');
const cmsController = require('../../controllers/salesman/cmsController');

router.get('/terms', cmsController.getTermsCondition);

router.get('/about', cmsController.getAbout);

router.get('/privacy', cmsController.getPrivacy);

router.get('/faq', cmsController.getFAQs);

router
    .route('/contact')
    .get(cmsController.getContact)
    .post(fileUpload(), cmsController.postContact);

module.exports = router;
