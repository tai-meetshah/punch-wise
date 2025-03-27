const router = require('express').Router();

const companyController = require('../../controllers/admin/CompanyController');

router.get('/company', companyController.getAllUsers);
router.get('/company/:id', companyController.viewUser);
router.get('/company/delete/:id', companyController.getDeleteUser);

router.get('/company/block/:id', companyController.blockUser);
router.get('/company/unblock/:id', companyController.unblockUser);

router.get('/message-company', companyController.getAllMessages);
router.get('/message-company/:id', companyController.viewMessages);
router.get('/message-company/delete/:id', companyController.getDeleteMessages);

module.exports = router;
