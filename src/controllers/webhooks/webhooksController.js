const bunyan = require("bunyan");
const routes = require("express").Router();

const CustomError = require("./../../class/CustomError");

const auth = require("../../middlewares/shopifyAuthMiddleware");

const indecxApi = require("../../shared/indecxApi");
const userRepository = require("../../repositorys/userRepository");
const productRepository = require("../../repositorys/productRepository");
const downloadUrlRepository = require("../../repositorys/downloadUrlRepository");

const webHookLog = bunyan.createLogger({
  name: "Webhooks",
  streams: [
    {
      level: "info",
      stream: process.stdout,
    },
    {
      level: "error",
      path: "/var/tmp/lenofxAppconnect/webhooks-error.log",
    },
  ],
});

const orderLog = bunyan.createLogger({
  name: "OrderWebHook",
  streams: [
    {
      level: "info",
      stream: process.stdout,
    },
    {
      level: "error",
      path: "/var/tmp/lenofxAppconnect/webhooks-orders-error.log",
    },
  ],
});

routes.post("/order-create", async (req, res, next) => {
  const { id, created_at, name, line_items, customer } = req.body;

  try {
    for (let product of line_items) {
      if (
        await productRepository.isBundle(product.product_id)
      ) {
        const productsOfBundle = await productRepository.getProductsOfBundle(
          product.product_id
        );
        for (let subProduct of productsOfBundle) {
          await downloadUrlRepository.registerOrder(
            customer.id,
            subProduct.ProductID,
            id,
            subProduct.Title,
            product.product_id,
            0
          );
        }
      }
      await downloadUrlRepository.registerOrder(
        customer.id,
        product.product_id,
        id,
        product.title,
        product.product_id,
        0
      );
    }
  } catch (trace) {
    orderLog.error(trace);
    orderLog.info(trace);
    next(
      CustomError.badRequest({
        message: "Order create failed",
        trace,
      })
    );
  }

  try {
    for (let product of line_items) {
      await indecxApi.registerAction(
        "MEA30N",
        {
          nome: `${customer.first_name} ${customer.last_name}`,
          email: customer.email,
          telefone: "",
          product: product.title,
          country: customer.default_address.country,
          order_name: name,
          day: created_at.substr(0, created_at.lastIndexOf("T")),
        },
        indecxApi.setLocaleTimeOfAction(
          customer.default_address.city,
          customer.default_address.province_code,
          customer.default_address.country_code
        )
      );
    }
  } catch (trace) {
    orderLog.error(trace);
  }

  return res.status(201).send({ message: "Order registered successfuly!" });
});

routes.post("/product-create", async (req, res, next) => {
  const { id, title, handle, variants } = req.body;
  try {
    await productRepository.save({
      ProductID: id,
      Title: title,
      Handle: handle,
      RetailPrice: variants[0].price,
    });
    return res.status(201).send({ message: "Product created successfuly!" });
  } catch (error) {
    next(CustomError.badRequest(error));
  }
});

routes.post("/product-update", async (req, res, next) => {
  const { id, title, handle, variants } = req.body;
  await productRepository.update("ProductID", id, {
    Title: title,
    Handle: handle,
    RetailPrice: variants[0].price,
  });
  return res.status(200).send({ message: "Product updated successfuly!" });
});

routes.post("/customer-create", async (req, res, next) => {
  const { id, email, first_name, last_name } = req.body;
  try {
    await userRepository.save({
      ShopifyCustomerNumber: id,
      MemberLevel: 0,
      CustomerName: `${first_name} ${last_name}`,
      CustomerEmail: email,
      Credits: 0,
      Subscriber: 0,
      NextBillDate: 0,
    });
    return res.status(201).send({ message: "Customer created successfuly!" });
  } catch (error) {
    next(CustomError.badRequest(error));
  }
});

module.exports = (app) => app.use("/webhooks", auth(), routes);
