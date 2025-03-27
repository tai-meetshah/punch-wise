const router = require('express').Router();

const salesmanController = require('../../controllers/admin/salesmanController');

router.get('/salesman', salesmanController.getAllUsers);
router.get('/salesman/:id', salesmanController.viewUser);
router.get('/salesman/delete/:id', salesmanController.getDeleteUser);

router.get('/salesman/block/:id', salesmanController.blockUser);
router.get('/salesman/unblock/:id', salesmanController.unblockUser);

router.get('/message-salesman', salesmanController.getAllMessages);
router.get('/message-salesman/:id', salesmanController.viewMessages);
router.get('/message-salesman/delete/:id', salesmanController.getDeleteMessages);

module.exports = router;
