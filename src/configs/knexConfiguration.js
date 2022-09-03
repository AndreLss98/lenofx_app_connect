const {
    ENV,
    DB_HOST_DEV,
    DB_USER_DEV,
    DATABASE_DEV,
    DB_PASSWORD_DEV,

    DB_HOST_HOMOLOG,
    DB_USER_HOMOLOG,
    DATABASE_HOMOLOG,
    DB_PASSWORD_HOMOLOG,

    DB_HOST_PROD,
    DB_USER_PROD,
    DATABASE_PROD,
    DB_PASSWORD_PROD
} = process.env;

const CONFIG = {
    development: {
        client: 'mysql',
        connection: {
            host: DB_HOST_DEV,
            database: DATABASE_DEV,
            user: DB_USER_DEV,
            password: DB_PASSWORD_DEV
        },
        acquireConnectionTimeout: 10000
    },
    homolog: {
        client: 'mysql',
        connection: {
            host: DB_HOST_HOMOLOG,
            database: DATABASE_HOMOLOG,
            user: DB_USER_HOMOLOG,
            password: DB_PASSWORD_HOMOLOG
        },
        acquireConnectionTimeout: 10000
    },
    production: {
        client: 'mysql',
        connection: {
            host: DB_HOST_PROD,
            database: DATABASE_PROD,
            user: DB_USER_PROD,
            password: DB_PASSWORD_PROD
        },
        acquireConnectionTimeout: 10000
    }
};

module.exports = require('knex')(CONFIG[ENV]);