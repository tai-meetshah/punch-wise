module.exports = (error, req, res, next) => {

    if (error.code == 11000) {
        return res.status(403).json({
            success: false,
            code: 403,
            message: `${
                Object.keys(error.keyPattern)[0]
            } is already registered.`,
        });
    }

    if (error.name === 'ValidationError') {
        let errors = {};
        Object.keys(error.errors).forEach(key => {
            if (error.errors[key].name == 'CastError')
                errors[key] = `Invalid value for ${error.errors[key].path}`;
            else errors[key] = error.errors[key].message;
        });
        return res.status(400).json({
            success: false,
            code: 400,
            message: Object.values(errors)[0] || 'Validation Error',
            errors,
        });
    }

    if (error.name == 'BadRequestError' && error.message.errors) {
        let errors = {};
        Object.keys(error.message.errors).forEach(key => {
            let myKey = key;
            if (myKey.includes('.')) myKey = myKey.split('.').pop();
            errors[myKey] = error.message.errors[key].message;
        });
        return res.status(400).json({
            success: false,
            code: 400,
            message: Object.values(errors)[0] || 'Validation Error',
            errors,
        });
    }

    if (error.name == 'MulterError') error.status = 413;

    if (
        error.message.toString().includes(': ') &&
        error.name == 'BadRequestError'
    ) {
        error.message = error.message.toString().split(': ').pop();
    }

    if (
        error.message == 'invalid signature' ||
        error.message == 'jwt malformed'
    )
        return res.status(400).json({
            success: false,
            code: 400,
            message: 'Invalid token.',
        });

    res.status(error.status || 500).json({
        success: false,
        code: error.status || 500,
        message: error.message,
        errorCode: res.errorCode,
    });
};
