const crypto = require('crypto');
const CustomError = require('../class/CustomError');

const {
    ENV,
    SHOPIFY_WEBHOOK_TOKEN,
} = process.env;

module.exports = () => {
    return async (req, res, next) => {
        if (ENV === 'production') {
            let hmac = crypto.createHmac('sha256', SHOPIFY_WEBHOOK_TOKEN).update(req.rawBody).digest('base64');
            hmac === req.headers['x-shopify-hmac-sha256']? next() : next(CustomError.Unauthorized({ message: "Invalid key" }));
        } else {
            next();
        }
    }
}