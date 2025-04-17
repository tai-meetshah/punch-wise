const router = require('express').Router();
const fileUpload = require('express-fileupload');

const { checkSalesman } = require('../../controllers/salesman/authController');
const taskController = require('../../controllers/salesman/taskController');

router.get('/task-list', checkSalesman, taskController.taskList);

//* salesman can not add task

// router.post('/start-task', fileUpload(), checkSalesman, taskController.addTask);
// router.post('/complete-task', fileUpload(), checkSalesman, taskController.addTask);

// router.post('/shift-change', fileUpload(), checkSalesman, taskController.addTask);

module.exports = router;
