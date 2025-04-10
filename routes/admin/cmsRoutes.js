const router = require('express').Router();

const cmsController = require('../../controllers/admin/cmsController');
const { upload } = require('../../controllers/uploadController');

router
    .route('/term')
    .get(cmsController.getTerms)
    .post(upload.single('image'), cmsController.postTerms);

router
    .route('/privacy')
    .get(cmsController.getPrivacy)
    .post(upload.single('image'), cmsController.postPrivacy);

router
    .route('/contact')
    .get(cmsController.getContact)
    .post(cmsController.postContact);

// Vendor FAQs
router.get('/vendor/faqs', cmsController.getVendorFAQs);

router
    .route('/vendor/faqs/add')
    .get(cmsController.getAddVendorFAQ)
    .post(cmsController.postAddVendorFAQ);

router
    .route('/vendor/faqs/edit/:id')
    .get(cmsController.getEditVendorFAQ)
    .post(cmsController.postEditVendorFAQ);

router.get('/vendor/faqs/delete/:id', cmsController.getdeleteVendorFAQ);

// User FAQs
router.get('/user/faqs', cmsController.getUserFAQs);

router
    .route('/user/faqs/add')
    .get(cmsController.getAddUserFAQ)
    .post(cmsController.postAddUserFAQ);

router
    .route('/user/faqs/edit/:id')
    .get(cmsController.getEditUserFAQ)
    .post(cmsController.postEditUserFAQ);

router.get('/user/faqs/delete/:id', cmsController.getdeleteUserFAQ);

module.exports = router;
