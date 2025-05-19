const router = require('express').Router();
const fileUpload = require('express-fileupload');

const { checkSalesman } = require('../../controllers/salesman/authController');
const taskController = require('../../controllers/salesman/taskController');
const { upload } = require('../../controllers/uploadController');

router.get('/task-list', checkSalesman, taskController.taskList);

//* salesman can not add task

router.post(
    '/start-task',
    fileUpload(),
    checkSalesman,
    taskController.startTask
);
router.post(
    '/complete-task',
    upload.fields([{ name: 'img', maxCount: 1 }]),
    checkSalesman,
    taskController.completeTask
);

router.post(
    '/edit-complete-task',
    upload.fields([{ name: 'img', maxCount: 1 }]),
    checkSalesman,
    taskController.completeTask
);

router.get('/shift-change-list', checkSalesman, taskController.shiftList);
router.post(
    '/shift-change-request',
    fileUpload(),
    checkSalesman,
    taskController.changeShiftRequest
);
router.post(
    '/edit-shift-change-request',
    fileUpload(),
    checkSalesman,
    taskController.editShift
);
router.post(
    '/cancell-shift-change-request',
    fileUpload(),
    checkSalesman,
    taskController.cancellShift
);

module.exports = router;
