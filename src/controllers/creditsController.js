const routes = require('express').Router();

const UserRepository = require('../repositorys/userRepository');

const { REQUEST_OBJECTS } = require('../shared/constants');

const CheckCreditsDto = require('../dto/CheckCreditsDto');
const ValidateDtoMiddleware = require('../middlewares/validateDtoMiddleware');
const CustomError = require('../class/CustomError');

/**
 * Check quantity credits of a user
 */
routes.post('/check', ValidateDtoMiddleware(CheckCreditsDto, REQUEST_OBJECTS.BODY), async (req, res, next) => {
    const user = await UserRepository.getUserByKey('ShopifyCustomerNumber', req.body.CustomerID, ['Credits']);
    if (user) {
        return res.status(200).send(user);
    } else {
        next(CustomError.NotFound({ message: "User Not Found" }));
    }
});

module.exports = app => app.use('/credits', routes);