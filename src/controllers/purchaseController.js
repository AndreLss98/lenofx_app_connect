const routes = require("express").Router();
const semver = require("semver");

const CustomError = require("../class/CustomError");

const GetUserHistoryDto = require("../dto/GetUserHistoryDto");
const ValidatePurchaseDto = require("../dto/ValidatePurchaseDto");
const CreateDownloadLInkDto = require("../dto/CreateDownloadLinkDto");
const validateDtoMiddleware = require("../middlewares/validateDtoMiddleware");

const userRepository = require("./../repositorys/userRepository");
const productRepository = require("../repositorys/productRepository");
const downloadRepository = require("./../repositorys/downloadUrlRepository");
const creditUsageLogRepository = require("../repositorys/creditUsageLogRepository");

const { REQUEST_OBJECTS } = require("../shared/constants");

const s3 = require("./../shared/AmazonServices/AmazonServiceS3");
const orderProductsDto = require("../dto/orderProductsDto");

routes.post(
  "/validate",
  validateDtoMiddleware(ValidatePurchaseDto, REQUEST_OBJECTS.BODY),
  async (req, res, next) => {
    const { Customer, ItemID } = req.body;

    try {
      let link = await downloadRepository.checkPurchase(Customer, ItemID);
      let product = await productRepository.getBySeachKey("ProductID", ItemID, [
        "Version",
      ]);
      link.Version = semver.gt(product.Version, link.Version)
        ? "Update"
        : "Download";

      return res.status(200).send({
        response: link ? link : false,
      });
    } catch (error) {
      next(CustomError.badRequest(error));
    }
  }
);

routes.get(
  "/user-history",
  validateDtoMiddleware(GetUserHistoryDto, REQUEST_OBJECTS.QUERY),
  async (req, res, next) => {
    const { Customer } = req.query;

    try {
      return res
        .status(200)
        .send(await downloadRepository.getUserHistory(Customer));
    } catch (error) {
      next(CustomError.badRequest(error));
    }
  }
);

routes.get(
  "/orderProducts",
  validateDtoMiddleware(orderProductsDto, REQUEST_OBJECTS.QUERY),
  async (req, res, next) => {
    const { Customer, OrderNumber } = req.query;
    try {
      return res
        .status(200)
        .send(await downloadRepository.getOrderProducts(Customer, OrderNumber));
    } catch (error) {
      next(CustomError.badRequest(error));
    }
  }
);

routes.post(
  "/createDownloadLink",
  validateDtoMiddleware(CreateDownloadLInkDto, REQUEST_OBJECTS.BODY),
  async (req, res, next) => {
    const { ItemID, CustomerNumber } = req.body;
    let links = [];
    console.log("Start create link!");
    try {
      const product = await productRepository.getByProductKey(
        "ProductID",
        ItemID,
        ["ProductID", "Title", "FileName", "RetailPrice", "Version"]
      );
      const downloadLink = await downloadRepository.checkPurchase(
        CustomerNumber,
        ItemID
      );
      const isBundle = await productRepository.isBundle(product.ProductID);
      let productsOfBundle = [];

      if (!downloadLink) {
        if (product.RetailPrice && product.RetailPrice > 0) {
          const user = await userRepository.getUserByKey(
            "ShopifyCustomerNumber",
            CustomerNumber,
            ["Credits"]
          );
          user.Credits = --user.Credits;
          await userRepository.update(
            "ShopifyCustomerNumber",
            CustomerNumber,
            user
          );

          if (!isBundle) {
            await downloadRepository.registerOrder(
              CustomerNumber,
              ItemID,
              null,
              product.Title,
              ItemID,
              1,
              product.Version
            );
          } else {
            productsOfBundle = await productRepository.getProductsOfBundle(
              product.ProductID
            );
            for (let subProduct of productsOfBundle) {
              await downloadRepository.registerOrder(
                CustomerNumber,
                subProduct.ProductID,
                null,
                subProduct.Title,
                ItemID,
                1,
                subProduct.Version
              );
            }
          }

          await creditUsageLogRepository.registerLog(
            CustomerNumber,
            ItemID,
            product.Title,
            1
          );
        } else {
          if (!isBundle) {
            await downloadRepository.registerOrder(
              CustomerNumber,
              ItemID,
              null,
              product.Title,
              ItemID,
              0,
              product.Version
            );
          } else {
            productsOfBundle = await productRepository.getProductsOfBundle(
              product.ProductID
            );
            for (let subProduct of productsOfBundle) {
              await downloadRepository.registerOrder(
                CustomerNumber,
                subProduct.ProductID,
                null,
                subProduct.Title,
                ItemID,
                0,
                subProduct.Version
              );
            }
          }

          await creditUsageLogRepository.registerLog(
            CustomerNumber,
            ItemID,
            product.Title,
            0
          );
        }
      } else {
        await downloadRepository.update(downloadLink.LinkID, {
          Version: product.Version,
        });
      }

      // Get All Download Links of a Bundle
      /* if (isBundle) {
        productsOfBundle = await productRepository.getProductsOfBundle(product.ProductID);
        for (let subProduct of productsOfBundle) {
          links.push(await s3.getObjectTemporaryUri(subProduct.FileName));
        }
      } else {
        links.push(await s3.getObjectTemporaryUri(product.FileName));
      } */

      links.push(await s3.getObjectTemporaryUri(product.FileName));
      return res
        .status(201)
        .send({ message: "Created download link successfuly!", links });
    } catch (error) {
      next(CustomError.badRequest(error));
    }
  }
);

module.exports = (app) => app.use("/purchase", routes);
