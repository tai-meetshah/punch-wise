const router = require('express').Router();
const fileUpload = require('express-fileupload');

const { checkSalesman } = require('../../controllers/salesman/authController');
const expensesController = require('../../controllers/salesman/expensesController');
const { upload } = require('../../controllers/uploadController');

router.get('/expenses-list', checkSalesman, expensesController.expensesList);

router.post(
    '/add-expenses',
    upload.fields([
        { name: 'receipt', maxCount: 1 },
    ]),
    checkSalesman,
    expensesController.addExpenses
);
router.post(
    '/edit-expenses/:id',
    upload.fields([
        { name: 'receipt', maxCount: 1 },
    ]),
    checkSalesman,
    expensesController.editExpenses
);
router.get(
    '/cancel-expenses/:id',
    checkSalesman,
    expensesController.cancelExpenses
);

module.exports = router;
