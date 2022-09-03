const db = require('./../configs/knexConfiguration');

const CONSTANTS = require('./../shared/constants');

async function getByProductKey(key, value, fields) {
    try {
        return await db.select(fields).from(CONSTANTS.TABLE_NAMES.PRODUCT_TABLE).where(key, value ).first();
    } catch (error) {
        throw error;
    }
}

async function getProductsOfBundle(BundleProductID) {
    const productsIDS = await db.select(['ProductID']).from(CONSTANTS.TABLE_NAMES.BUNDLE_TABLE).where({ BundleProductID });
    let products = [];

    for (let { ProductID } of productsIDS) {
        const temp = await db.select(['ProductID', 'Handle', 'Title', 'FileName', 'Version']).from(CONSTANTS.TABLE_NAMES.PRODUCT_TABLE).where({ ProductID }).first();
        if(temp) products.push(temp);
    }

    return products;
}

async function save(product) {
    return await db(CONSTANTS.TABLE_NAMES.PRODUCT_TABLE).insert(product);
}

async function search(key, value, fields) {
    try {
        return await db.select(fields).from(CONSTANTS.TABLE_NAMES.PRODUCT_TABLE).where(key, value);
    } catch (error) {
        throw error;
    }
}

async function getBySeachKey(key, value, fields) {
    try {
        return await db.select(fields).from(CONSTANTS.TABLE_NAMES.PRODUCT_TABLE).where(key, value).first();
    } catch (error) {
        throw error;
    }
}

async function update(key, value, product) {
    try {
        product.UpgradedVersionAt = db.fn.now();
        return await db(CONSTANTS.TABLE_NAMES.PRODUCT_TABLE).update(product).where(key, value);
    } catch (error) {
        throw error;
    }
}

async function isBundle(ProductID) {
    try {
        return (await db.select(['p.ProductID'])
            .from(`${CONSTANTS.TABLE_NAMES.PRODUCT_TABLE} as p`)
            .innerJoin(`${CONSTANTS.TABLE_NAMES.BUNDLE_TABLE} as bp`, 'bp.BundleProductID', 'p.ProductID')
            .where('bp.BundleProductID', ProductID)).length? true : false;
    } catch(error) {
        console.log(error);
        throw error;
    }
}

module.exports = {
    save,
    update,
    search,
    isBundle,
    getBySeachKey,
    getByProductKey,
    getProductsOfBundle
}