const router = require('express').Router();
const fileUpload = require('express-fileupload');

const { checkManager } = require('../../controllers/manager/authController');
const expensesController = require('../../controllers/manager/expensesController');
const { upload } = require('../../controllers/uploadController');

// router.get('/expenses-list', checkManager, expensesController.expensesList);

router.get(
    '/salesman-expenses-requests',
    checkManager,
    expensesController.salesmanExpensesRequests
);
router.post(
    '/change-expenses-status/:id',
    fileUpload(),
    checkManager,
    expensesController.changeExpensesStatus
);
router.post(
    '/add-expenses',
    upload.fields([{ name: 'receipt', maxCount: 1 }]),
    checkManager,
    expensesController.addExpenses
);
router.post(
    '/edit-expenses/:id',
    upload.fields([{ name: 'receipt', maxCount: 1 }]),
    checkManager,
    expensesController.editExpenses
);
router.get(
    '/cancel-expenses/:id',
    checkManager,
    expensesController.cancelExpenses
);

module.exports = router;
