const router = require('express').Router();

const salesmanController = require('../../controllers/admin/salesmanController');

router.get('/', salesmanController.getAllUsers);
router.get('/:id', salesmanController.viewUser);
router.get('/delete/:id', salesmanController.getDeleteUser);

router.get('/block/:id', salesmanController.blockUser);
router.get('/unblock/:id', salesmanController.unblockUser);

router.get('/message-salesman', salesmanController.getAllMessages);
router.get('/message-salesman/:id', salesmanController.viewMessages);
router.get('/message-salesman/delete/:id', salesmanController.getDeleteMessages);

module.exports = router;
