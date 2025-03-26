const router = require('express').Router();
const fileUpload = require('express-fileupload');

const { checkManager } = require('../../controllers/manager/authController');
const leaveController = require('../../controllers/manager/leaveController');

router.get(
    '/salesman-leave-requests',
    checkManager,
    leaveController.salesmanLeaveRequests
);
router.post(
    '/change-leave-status/:id',
    fileUpload(),
    checkManager,
    leaveController.changeLeaveStatus
);

router.get('/leave-list', checkManager, leaveController.leaveList);
router.post(
    '/add-leave',
    fileUpload(),
    checkManager,
    leaveController.addLeave
);
router.post(
    '/edit-leave/:id',
    fileUpload(),
    checkManager,
    leaveController.editLeave
);
router.get('/cancel-leave/:id', checkManager, leaveController.cancelLeave);


module.exports = router;
