const router = require('express').Router();

const userController = require('../../controllers/admin/userController');

router.get('/user', userController.getAllUsers);
router.get('/user/:id', userController.viewUser);
router.get('/user/delete/:id', userController.getDeleteUser);

router.get('/user/block/:id', userController.blockUser);
router.get('/user/unblock/:id', userController.unblockUser);

router.get('/message-user', userController.getAllMessages);
router.get('/message-user/:id', userController.viewMessages);
router.get('/message-user/delete/:id', userController.getDeleteMessages);

module.exports = router;
