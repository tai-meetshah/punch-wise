const multer = require('multer');
const createError = require('http-errors');

exports.upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './public/uploads/');
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + file.originalname.replaceAll(' ', ''));
        },
    }),
    limits: { fileSize: 1024 * 1024 * 10 },
    fileFilter: (req, file, cb) => {
        // reject a file
        if (
            file.mimetype === 'image/jpeg' ||
            file.mimetype === 'image/png' ||
            file.mimetype === 'image/jpg'
        )
            cb(null, true);
        else
            cb(createError.BadRequest('Please upload jpg or png file.'), false);
    },
});

exports.uploadCmsImage = async (req, res) => {
    try {
        if (!req.file) return res.send('File not uploaded.');

        const url = `${process.env.BASE_URL}/uploads/${req.file.filename}`;
        const send = `<script>window.parent.CKEDITOR.tools.callFunction('${req.query.CKEditorFuncNum}', '${url}');</script>`;
        res.send(send);
    } catch (error) {
        res.send(error.message);
    }
};

exports.uploadMedia = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './public/uploads/');
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname.toUpperCase());
        },
    }),
    limits: { fileSize: 1024 * 1024 * 10 },
    fileFilter: (req, file, cb) => {
        // reject a file
        if (
            file.mimetype === 'image/jpeg' ||
            file.mimetype === 'image/png' ||
            file.mimetype === 'image/jpg'
        )
            cb(null, true);
        else cb(new Error('Please upload jpg or png file.'), false);
    },
});

exports.uploadCSV = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        // reject a file
        if (file.mimetype === 'text/csv') cb(null, true);
        else cb(null, false);
    },
});