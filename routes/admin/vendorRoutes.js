const router = require('express').Router();

const vendorController = require('../../controllers/admin/vendorController');

router.get('/vendor', vendorController.getAllVendors);
router.get('/vendor/:id', vendorController.viewVendor);
router.get('/vendor/delete/:id', vendorController.getDeleteVendor);

router.get('/vendor/block/:id', vendorController.blockVendor);
router.get('/vendor/unblock/:id', vendorController.unblockVendor);

router.get('/message-vendor', vendorController.getAllMessages);
router.get('/message-vendor/:id', vendorController.viewMessages);
router.get('/message-vendor/delete/:id', vendorController.getDeleteMessages);

module.exports = router;
