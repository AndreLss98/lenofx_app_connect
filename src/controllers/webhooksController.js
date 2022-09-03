const bunyan = require('bunyan');
const routes = require('express').Router();

const auth = require('../middlewares/shopifyAuthMiddleware');

const indecxApi = require('./../shared/indecxApi');
const ProductRepository = require('./../repositorys/productRepository');
const DownloadUrlRepository = require('./../repositorys/downloadUrlRepository');

const webHookLog = bunyan.createLogger({
    name: 'Webhooks',
    streams: [
        {
            level: 'info',
            stream: process.stdout
        },
        {
            level: 'error',
            path: '/var/tmp/lenofxAppconnect/webhooks-error.log'
        }
    ]
});

const orderLog = bunyan.createLogger({
    name: 'OrderWebHook',
    streams: [
        {
            level: 'info',
            stream: process.stdout
        },
        {
            level: 'error',
            path: '/var/tmp/lenofxAppconnect/webhooks-orders-error.log'
        }
    ]
});

routes.post('/order-create', async (req, res, next) => {
    const {
        id, created_at, name,
        line_items, customer
    } = req.body;

    try {
        for (let product of line_items) {
            if (product.title.toLowerCase().includes('pack')) {
                const productsOfBundle = await ProductRepository.getProductsOfBundle(product.product_id);
                for (let subProduct of productsOfBundle) {
                    await DownloadUrlRepository.registerOrder(
                        customer.id,
                        subProduct.ProductID, id,
                        subProduct.Title,
                        product.product_id, 0);
                }
            } else {
                await DownloadUrlRepository.registerOrder(
                    customer.id,
                    product.product_id, id,
                    product.title,
                    product.product_id, 0);
            }
        }
    } catch (trace) {
        orderLog.error(trace);
        return res.status(400).send({
           message: "Order create failed",
           trace
        });
    }

    try {
        for (let product of line_items) {
            await indecxApi.registerAction('MEA30N', {
                nome: `${customer.first_name} ${customer.last_name}`,
                email: customer.email,
                telefone: '',
                product: product.title,
                country: customer.default_address.country,
                order_name: name,
                day: created_at.substr(0, created_at.lastIndexOf('T')),
            }, indecxApi.setLocaleTimeOfAction(customer.default_address.city, customer.default_address.province_code, customer.default_address.country_code));
        }
    } catch (trace) {
        orderLog.error(trace);
    }

    return res.status(201).send({ message: "Order registered successfuly!" });
});

module.exports = app => app.use('/webhooks', auth(), routes);