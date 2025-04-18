const router = require('express').Router();
const fileUpload = require('express-fileupload');

const { checkCompany } = require('../../controllers/company/authController');
const leaveController = require('../../controllers/company/leaveController');

router.get(
    '/salesman-leave-requests',
    checkCompany,
    leaveController.salesmanLeaveRequests
);

router.get(
    '/manager-leave-requests',
    checkCompany,
    leaveController.managerLeaveRequests
);

router.post(
    '/change-leave-status/:id',
    fileUpload(),
    checkCompany,
    leaveController.changeLeaveStatus
);

router.get('/leave-list', checkCompany, leaveController.leaveList);

module.exports = router;
