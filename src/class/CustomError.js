class CustomError {

    constructor(status, message, error) {
        this.status = status;
        this.message = message;
    }

    static badRequest(message) {
        return new CustomError(400, message);
    }

    static Unauthorized(message) {
        return new CustomError(401, message);
    }

    static NotFound(message) {
        return new CustomError(404, message);
    }

    static serverError(message) {
        return new CustomError(500, message);
    }

}

module.exports = CustomError;