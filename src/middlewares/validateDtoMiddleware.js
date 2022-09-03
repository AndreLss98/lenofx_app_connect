const CustomError = require("../class/CustomError");

module.exports = (schema, req_object) => {
    return async (req, res, next) => {
        try {
            await schema.validate(req[req_object]);
            next();
        } catch (error) {
            next(CustomError.badRequest(error));
        }
    }
}