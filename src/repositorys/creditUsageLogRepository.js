const db = require('./../configs/knexConfiguration');

const CONSTANTS = require('./../shared/constants');

async function registerLog(CustomerID, ItemID, ItemTitle, CreditsUsed = 0) {

    try {
        await db(CONSTANTS.TABLE_NAMES.CREDIT_USAGE_LOG_TABLE).insert({
            CustomerID,
            ItemID,
            ItemTitle,
            UsageDate: db.fn.now(),
            CreditsUsed
        });
    } catch (error) {
        throw error;
    }
}

module.exports = {
    registerLog
}