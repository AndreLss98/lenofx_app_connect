const fs = require('fs');
const readline = require('readline');

const routes = require('express').Router();
const semver = require('semver');
const db = require('./../configs/knexConfiguration');

const CustomError = require('../class/CustomError');
const LoginRegisterDto = require('../dto/LoginRegisterDto');
const UserRepository = require('./../repositorys/userRepository');
const ProductRepository = require('./../repositorys/productRepository');
const DownloadRepository = require('./../repositorys/downloadUrlRepository');
const validateDtoMiddleware = require('../middlewares/validateDtoMiddleware');

const { REQUEST_OBJECTS } = require('../shared/constants');
const GetUserHistoryDto = require('../dto/GetUserHistoryDto');

const log = require('bunyan').createLogger({
    name: 'userController',
    streams: [
        /* {
            level: 'info',
            stream: process.stdout
        }, */
        {
            type: 'rotating-file',
            period: '2m',
            count: 3,
            level: 'info',
            path: '/var/tmp/lenofxAppconnect/user-controller-error.log'
        }
    ]
});

routes.put('/login-register', validateDtoMiddleware(LoginRegisterDto, REQUEST_OBJECTS.BODY),  async (req, res, next) => {
    const CustomerID = parseInt(req.body.CustomerID);
    
    try {
        await UserRepository.update('ShopifyCustomerNumber', CustomerID, { LastAccess: db.fn.now() });
        await UserRepository.registerAccessLog(CustomerID);
        log.info({user: req.body}, "User access");
        
        /* const readlineInteface = readline.createInterface({
            input: fs.createReadStream('/var/tmp/lenofxAppconnect/user-controller-error.log'),
            output: null,
            console: false
        }); */

        /* await readlineInteface.on('line', (line) => {
            console.log(line);
        }); */

        /* const logs = fs.readFile('/var/tmp/lenofxAppconnect/user-controller-error.log', 'utf-8', (err, data) => {
            console.log(data);
        }); */

        return res.status(200).send({ message: 'Last access updated' });
    } catch (trace) {
        next(CustomError.badRequest({ message: 'User not found', trace }));
    }
});

routes.get('/history-validate', validateDtoMiddleware(GetUserHistoryDto, REQUEST_OBJECTS.QUERY), async (req, res, next) => {
    const Customer = parseInt(req.query.Customer);

    try {
        const historic = await DownloadRepository.search('Customer', Customer, ['ItemID', 'Version']);
        
        for (let download of historic) {
            const product = await ProductRepository.getByProductKey('ProductID', download.ItemID, ['Version']);
            
            if (semver.gt(product.Version, download.Version)) {
                return res.status(200).send({ response: 'Update' });
            }
        }

        return res.status(200).send({ response: 'Download' });
    } catch(trace) {
        next(CustomError.badRequest({ message: 'User not found', trace }));
    }
});

module.exports = app => app.use('/user', routes);