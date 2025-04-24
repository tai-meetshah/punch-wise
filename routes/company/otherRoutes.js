const router = require('express').Router();
const fileUpload = require('express-fileupload');

const { checkCompany } = require('../../controllers/company/authController');
const otherController = require('../../controllers/company/otherController');

router.get('/manager-list', checkCompany, otherController.getManager);

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

router.get('/client-list', checkCompany, otherController.getClient);
router.post(
    '/add-client',
    checkCompany,
    fileUpload(),
    otherController.addClient
);
router.post(
    '/edit-client',
    fileUpload(),
    checkCompany,
    otherController.editClient
);
router.post(
    '/update-client-status',
    fileUpload(),
    checkCompany,
    otherController.updateClientStatus
);

module.exports = router;
