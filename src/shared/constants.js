const TABLE_NAMES = {
    USER_TABLE: 'Customers',
    PRODUCT_TABLE: 'ProductLookup',
    BUNDLE_TABLE: 'BundleProduct',
    DOWNLOAD_LINKS_TABLE: 'DownloadLinks',
    CREDIT_USAGE_LOG_TABLE: 'CreditUsageLog',
    CUSTOMER_ACCESS_LOG: 'CustomerAccessLog'
}

const ENVIRONMENTS_NAMES = {
    PRODUCTION: 'production',
    HOMOLOG: 'homolog',
    DEVELOPMENT: 'development'
}

const REQUEST_OBJECTS = {
    BODY: 'body',
    PARAMS: 'params',
    QUERY: 'query'
}

const SECOND = 1;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const HOST_WHITE_LIST = [
    'https://lenofx.com'
];

module.exports = {
    ENVIRONMENTS_NAMES,
    REQUEST_OBJECTS,
    HOST_WHITE_LIST,
    TABLE_NAMES,
    SECOND,
    MINUTE,
    HOUR,
    DAY,
}