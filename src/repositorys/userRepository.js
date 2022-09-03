const db = require('./../configs/knexConfiguration');

const CONSTANTS = require('./../shared/constants');

async function save(user) {
    return await db(CONSTANTS.TABLE_NAMES.USER_TABLE).insert(user);
}

async function getUserByEmail(CustomerEmail) {
    return await db(CONSTANTS.TABLE_NAMES.USER_TABLE).where({ CustomerEmail }).first();
}

async function getUserByKey(key, value, fields) {
    return await db.select(fields).from(CONSTANTS.TABLE_NAMES.USER_TABLE).where(key, value).first();
}

async function update(key, value, user) {
    delete user.CustomerID;
    delete user.ShopifyCustomerNumber;
    
    return await db(CONSTANTS.TABLE_NAMES.USER_TABLE).where(key, value).update(user);
}

async function registerAccessLog(CustomerID) {
    try {
        return await db(CONSTANTS.TABLE_NAMES.CUSTOMER_ACCESS_LOG).insert({CustomerID});
    } catch (error) {
        throw error;
    }
}

module.exports = {
    save,
    update,
    getUserByKey,
    getUserByEmail,
    registerAccessLog
};