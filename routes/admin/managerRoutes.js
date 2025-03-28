const router = require('express').Router();

const managerController = require('../../controllers/admin/managerController');

router.get('/', managerController.getAllUsers);
router.get('/:id', managerController.viewUser);
router.get('/delete/:id', managerController.getDeleteUser);

router.get('/block/:id', managerController.blockUser);
router.get('/unblock/:id', managerController.unblockUser);

router.get('/message-manager', managerController.getAllMessages);
router.get('/message-manager/:id', managerController.viewMessages);
router.get('/message-manager/delete/:id', managerController.getDeleteMessages);

module.exports = router;
