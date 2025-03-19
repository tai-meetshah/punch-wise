const router = require('express').Router();
const fileUpload = require('express-fileupload');

const { checkSalesman } = require('../../controllers/salesman/authController');
const leaveController = require('../../controllers/salesman/leaveController');

router.get('/leave-list', checkSalesman, leaveController.leaveList);

router.post(
    '/add-leave',
    fileUpload(),
    checkSalesman,
    leaveController.addLeave
);
router.post(
    '/edit-leave/:id',
    fileUpload(),
    checkSalesman,
    leaveController.editLeave
);
router.get('/cancel-leave/:id', checkSalesman, leaveController.cancelLeave);

module.exports = router;
