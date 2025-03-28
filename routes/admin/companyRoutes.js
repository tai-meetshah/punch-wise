const router = require('express').Router();

const companyController = require('../../controllers/admin/CompanyController');

router.get('/', companyController.getAllUsers);
router.get('/:id', companyController.viewUser);
router.get('/delete/:id', companyController.getDeleteUser);

router.get('/block/:id', companyController.blockUser);
router.get('/unblock/:id', companyController.unblockUser);

router.get('/message-company', companyController.getAllMessages);
router.get('/message-company/:id', companyController.viewMessages);
router.get('/message-company/delete/:id', companyController.getDeleteMessages);

module.exports = router;
