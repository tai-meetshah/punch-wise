const router = require('express').Router();
const fileUpload = require('express-fileupload');

const { checkSalesman } = require('../../controllers/salesman/authController');
const { upload } = require('../../controllers/uploadController');
const activityController = require('../../controllers/salesman/activityController');

router.post('/check-in', checkSalesman, activityController.checkInTime);
router.post('/check-out', checkSalesman, activityController.checkOut);

router.post('/start-break', checkSalesman, activityController.startBreak);
router.post('/end-break', checkSalesman, activityController.endBreak);

router.get(
    '/working-hours/:salesmanId',
    checkSalesman,
    activityController.workingHours
);
router.get(
    '/today-working-hours/:salesmanId',
    checkSalesman,
    activityController.TodayWorkingHours
);

module.exports = router;
