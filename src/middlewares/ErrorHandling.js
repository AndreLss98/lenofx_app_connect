const CustomError = require('../class/CustomError');

function ApiErrorHandler (error, req, res, next) {
    
    if (error instanceof CustomError) {
        return res.status(error.status).send(error.message);
    }

    return res.status(500).send({ message: "Somenthing went wrong" });
}

module.exports = ApiErrorHandler;