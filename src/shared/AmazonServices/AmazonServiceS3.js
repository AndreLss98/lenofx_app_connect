const {
    ENV,
    AWS_ID,
    AWS_SECRET,
    AWS_BUCKET_REGION,
    AWS_BUCKET_NAME_DEV,
    AWS_BUCKET_NAME_PROD,
} = process.env;

const aws = require('aws-sdk');
const CONSTANTS = require('./../../shared/constants');

async function getObjectTemporaryUri(file) {
    const s3 = new aws.S3({
        accessKeyId: AWS_ID,
        secretAccessKey: AWS_SECRET,
        signatureVersion: 'v4',
        region: AWS_BUCKET_REGION
    });

    return s3.getSignedUrl('getObject', {
        Bucket: ENV === CONSTANTS.ENVIRONMENTS_NAMES.PRODUCTION? AWS_BUCKET_NAME_PROD : AWS_BUCKET_NAME_DEV,
        Key: file,
        Expires: CONSTANTS.DAY
    });
}

module.exports = {
    getObjectTemporaryUri
}