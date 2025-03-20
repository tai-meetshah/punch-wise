const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('cookie-session');
const flash = require('connect-flash');
const expressMessages = require('express-messages');
const createError = require('http-errors');

const globalErrorHandler = require('./controllers/errorConroller');
const uploadController = require('./controllers/uploadController');

// Start express app
const app = express();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(cookieParser(process.env.SESSION_SECRET));
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
    })
);

// Express Messages middleware
app.use(flash());
app.use((req, res, next) => {
    res.locals.messages = expressMessages(req, res);
    next();
});

// CORS middleware
const cors = require('cors');
app.use(cors());
const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200,
};
app.options('*', cors(corsOptions));

// caching disabled for every route
app.use(function (req, res, next) {
    res.set(
        'Cache-Control',
        'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0'
    );
    next();
});

// end app-assets
app.use('/app-assets/*', (req, res) => res.status(404).end());

// 404 uploads
app.use('/uploads/*', (req, res) => res.status(404).end());

// 2) salesman ROUTES
app.use('/api/salesman', require('./routes/salesman/authRoutes'));
app.use('/api/salesman', require('./routes/salesman/cmsRoutes'));
app.use('/api/salesman', require('./routes/salesman/dashboardRoutes'));
app.use('/api/salesman', require('./routes/salesman/leaveRoutes'));
app.use('/api/salesman', require('./routes/salesman/expensesRoutes'));

// 3) manager ROUTES
app.use('/api/manager', require('./routes/manager/authRoutes'));
app.use('/api/manager', require('./routes/manager/cmsRoutes'));
app.use('/api/manager', require('./routes/manager/dashboardRoutes'));
app.use('/api/manager', require('./routes/manager/leaveRoutes'));
app.use('/api/manager', require('./routes/manager/expensesRoutes'));

// 404 api
app.use('/api', (req, res, next) => {
    next(createError.NotFound(`Can't find ${req.originalUrl} on this server!`));
});

// 4) ADMIN ROUTES
app.post(
    '/upload',
    uploadController.upload.single('upload'),
    uploadController.uploadCmsImage
);

app.use(function (req, res, next) {
    res.locals.url = req.originalUrl;
    res.locals.title = 'punch-wise';
    res.locals.dateLocale = 'en-US';
    res.locals.timeOptions = {
        timeZone: 'America/Los_Angeles',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    };
    next();
});

app.use('/', require('./routes/admin/authRoutes'));
app.use('/cms', require('./routes/admin/cmsRoutes'));

// 404 admin
app.all('/*', (req, res) => {
    res.status(404).render('404', { message: 'Page not found!' });
});

// 5) ERROR HANDLING
app.use(globalErrorHandler);

module.exports = app;
