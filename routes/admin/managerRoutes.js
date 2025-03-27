const router = require('express').Router();

const managerController = require('../../controllers/admin/managerController');

router.get('/manager', managerController.getAllUsers);
router.get('/manager/:id', managerController.viewUser);
router.get('/manager/delete/:id', managerController.getDeleteUser);

router.get('/manager/block/:id', managerController.blockUser);
router.get('/manager/unblock/:id', managerController.unblockUser);

router.get('/message-manager', managerController.getAllMessages);
router.get('/message-manager/:id', managerController.viewMessages);
router.get('/message-manager/delete/:id', managerController.getDeleteMessages);

module.exports = router;
