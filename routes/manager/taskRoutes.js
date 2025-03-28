const router = require('express').Router();
const fileUpload = require('express-fileupload');

const { checkManager } = require('../../controllers/manager/authController');
const taskController = require('../../controllers/manager/taskController');

router.get('/salesman-list', checkManager, taskController.getSalesmanList);
router.get('/client-list', checkManager, taskController.getClientList);

router.get('/task-list', checkManager, taskController.taskList);

router.post('/add-task', fileUpload(), checkManager, taskController.addTask);
router.post(
    '/edit-task/:id',
    fileUpload(),
    checkManager,
    taskController.editTask
);

// router.post('/start-task', fileUpload(), checkManager, taskController.addTask);
// router.post('/complete-task', fileUpload(), checkManager, taskController.addTask);

// router.post('/shift-change', fileUpload(), checkManager, taskController.addTask);

module.exports = router;
