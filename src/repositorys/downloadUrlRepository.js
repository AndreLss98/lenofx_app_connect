const { v4: uuidv4 } = require('uuid');
const db = require('./../configs/knexConfiguration');

const CONSTANTS = require('./../shared/constants');

async function registerOrder(Customer, ItemID, OrderID, ItemTitle, ItemNumber, CreditsUsed = 0, Version) {

    try {
        await db(CONSTANTS.TABLE_NAMES.DOWNLOAD_LINKS_TABLE).insert({
            LinkGuid: uuidv4(),
            Customer,
            ItemID,
            OrderID,
            ItemTitle,
            ItemNumber,
            OrderDate: db.fn.now(),
            CreditsUsed,
            Version
        });
    } catch (error) {
        throw error;
    }
}

async function checkPurchase(Customer, ItemID) {
    try {
        return await db.select(['LinkID', 'Version' ]).from(CONSTANTS.TABLE_NAMES.DOWNLOAD_LINKS_TABLE).where({ Customer, ItemID }).first();
    } catch (error) {
        throw error;
    }
}

async function search(key, value, fields) {
    try {
        return await db.select(fields).from(CONSTANTS.TABLE_NAMES.DOWNLOAD_LINKS_TABLE).where(key, value);
    } catch (error) {
        throw error;
    }
}

async function getBySearchKey(key, value, fields) {
    try {
        return await db.select(fields).from(CONSTANTS.TABLE_NAMES.DOWNLOAD_LINKS_TABLE).where(key, value).first();
    } catch (error) {
        throw error;
    }
}

async function getUserHistory(Customer) {
    try {
        return db.select(['p.ProductID', 'p.Handle', 'p.Title', 'p.Version']).from(`${CONSTANTS.TABLE_NAMES.DOWNLOAD_LINKS_TABLE} as dl`)
            .innerJoin(`${CONSTANTS.TABLE_NAMES.PRODUCT_TABLE} as p`, 'p.ProductID', 'dl.ItemID').where('dl.Customer', Customer);
    } catch (error) { throw error }
}

async function getOrderProducts(Customer, OrderID) {
    try {
        return db.select(['p.ProductID', 'p.Title']).from(`${CONSTANTS.TABLE_NAMES.DOWNLOAD_LINKS_TABLE} as dl`)
            .innerJoin(`${CONSTANTS.TABLE_NAMES.PRODUCT_TABLE} as p`, 'p.ProductID', 'dl.ItemID').where('dl.Customer', Customer).andWhere('dl.OrderID', OrderID);
    } catch(error) { throw error }
}

async function update( LinkID, link ) {
    try {
        return db(CONSTANTS.TABLE_NAMES.DOWNLOAD_LINKS_TABLE).update(link).where({LinkID});
    } catch (error) {
        throw error;
    }
}


module.exports = {
    search,
    update,
    registerOrder,
    checkPurchase,
    getUserHistory,
    getBySearchKey,
    getOrderProducts,
}