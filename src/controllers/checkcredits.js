const routes = require('express').Router();

const UserRepository = require('./../repositorys/userRepository');

const CheckCreditsDto = require('./../dto/CheckCreditsDto');
const ValidateDtoMiddleware = require('./../middlewares/validateDtoMiddleware');
const CustomError = require('../class/CustomError');

routes.post('/checkcredits', ValidateDtoMiddleware(CheckCreditsDto), async (req, res, next) => {
    const user = await UserRepository.getUserByKey('ShopifyCustomerNumber', req.body.CustomerID, ['Credits']);
    if (user) {
        return res.status(200).send(user);
    } else {
        next(CustomError.NotFound({ message: "User Not Found" }));
    }
});

module.exports = app => app.use(routes);